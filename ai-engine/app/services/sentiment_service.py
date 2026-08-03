"""
FinBERT sentiment wrapper -- runs local ONNX inference (quantized INT8)
using onnxruntime directly, with the lightweight `tokenizers` library
instead of `transformers.AutoTokenizer`.

Deliberately avoids importing `transformers` or `torch` at runtime: this
process only needs to run one small quantized ONNX graph, and pulling in
the full transformers/torch stack just for tokenization defeats the whole
point of the ONNX conversion.

A single merged ONNX export is used, produced by wrapping the model so
one forward pass through the BERT encoder returns BOTH outputs at once:
  - last_hidden_state -> for the 768-dim CLS embedding fed into RiskService
  - logits             -> for sentiment label/confidence

This replaces the earlier two-export approach (separate embedding/ and
classification/ graphs), which duplicated the ~110MB encoder weights in
memory and was the direct cause of Render's free-tier 512MB OOM.

Quantized INT8, ~110MB total, downloaded once at startup from
Kushhhie/c2c-finbert-onnx (merged/ path) and cached locally by
huggingface_hub.

Interface matches what app/routers/analyze.py expects:
  - analyze(text) -> SentimentResult (single)
  - analyze_batch(texts) -> list[SentimentResult]
"""

import os
from dataclasses import dataclass

import numpy as np
import onnxruntime as ort
from huggingface_hub import hf_hub_download
from tokenizers import Tokenizer

ONNX_REPO_ID = os.getenv("ONNX_REPO_ID", "Kushhhie/c2c-finbert-onnx")

ID2LABEL = {0: "positive", 1: "negative", 2: "neutral"}


@dataclass
class SentimentResult:
    label: str
    confidence: float
    embedding: np.ndarray


class SentimentService:
    def __init__(self, repo_id: str = ONNX_REPO_ID):
        self.repo_id = repo_id

        # tokenizer.json alone is enough for the fast Rust tokenizer --
        # no need for vocab.txt/tokenizer_config.json/special_tokens_map.json,
        # those are only needed by the slower transformers-based tokenizer.
        tokenizer_path = hf_hub_download(repo_id=repo_id, filename="merged/tokenizer.json")
        self.tokenizer = Tokenizer.from_file(tokenizer_path)

        model_path = hf_hub_download(repo_id=repo_id, filename="merged/model_int8.onnx")

        # Single-threaded session: keeps onnxruntime's internal thread
        # pool/arena overhead down on a memory-constrained free instance.
        sess_options = ort.SessionOptions()
        sess_options.intra_op_num_threads = 1
        sess_options.inter_op_num_threads = 1

        # ONE session now instead of two -- this is the whole point of the
        # merge: one copy of the encoder weights in memory, not two.
        self.session = ort.InferenceSession(model_path, sess_options=sess_options)

    def _tokenize(self, text: str) -> dict:
        encoding = self.tokenizer.encode(text)
        input_ids = np.array([encoding.ids], dtype=np.int64)
        attention_mask = np.array([encoding.attention_mask], dtype=np.int64)
        # BERT-family models expect token_type_ids even for single-sequence
        # input -- all zeros is correct here (no second segment).
        token_type_ids = np.zeros_like(input_ids)
        return {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
            "token_type_ids": token_type_ids,
        }

    def _run(self, onnx_inputs: dict) -> tuple[np.ndarray, np.ndarray]:
        # Single .run() call returns both outputs from the one merged graph,
        # in the order declared by export_merged.py's output_names:
        # ["last_hidden_state", "logits"].
        input_names = [i.name for i in self.session.get_inputs()]
        filtered_inputs = {k: v for k, v in onnx_inputs.items() if k in input_names}
        last_hidden_state, logits = self.session.run(None, filtered_inputs)
        return last_hidden_state, logits

    def _classify(self, logits: np.ndarray) -> tuple[str, float]:
        probs = np.exp(logits) / np.exp(logits).sum(axis=-1, keepdims=True)
        pred_idx = int(np.argmax(probs, axis=-1)[0])
        label = ID2LABEL[pred_idx].upper()
        confidence = float(probs[0][pred_idx])
        return label, confidence

    def _embed(self, last_hidden_state: np.ndarray) -> np.ndarray:
        cls_embedding = last_hidden_state[:, 0, :][0]
        return cls_embedding.astype(np.float32)

    def analyze(self, text: str) -> SentimentResult:
        onnx_inputs = self._tokenize(text)
        last_hidden_state, logits = self._run(onnx_inputs)
        label, confidence = self._classify(logits)
        embedding = self._embed(last_hidden_state)
        return SentimentResult(label=label, confidence=confidence, embedding=embedding)

    def analyze_batch(self, texts: list[str]) -> list[SentimentResult]:
        return [self.analyze(text) for text in texts]