"""
FinBERT sentiment wrapper -- runs local ONNX inference (quantized INT8)
using onnxruntime directly, with the lightweight `tokenizers` library
instead of `transformers.AutoTokenizer`.

Deliberately avoids importing `transformers` or `torch` at runtime: this
process only needs to run two small quantized ONNX graphs, and pulling in
the full transformers/torch stack just for tokenization defeats the whole
point of the ONNX conversion (it's what was keeping memory high even
after switching inference itself to onnxruntime).

Two separate ONNX exports are used because a single export can't expose
both classification logits and raw hidden states simultaneously:
  - embedding/model_int8.onnx      -> feature-extraction export, gives
                                       last_hidden_state (for the 768-dim
                                       CLS embedding fed into RiskService)
  - classification/model_int8.onnx -> text-classification export, gives
                                       logits (for sentiment label/confidence)

Both are quantized INT8, ~110MB each, downloaded once at startup from
Kushhhie/c2c-finbert-onnx and cached locally by huggingface_hub.

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
        tokenizer_path = hf_hub_download(repo_id=repo_id, filename="tokenizer.json")
        self.tokenizer = Tokenizer.from_file(tokenizer_path)

        embedding_model_path = hf_hub_download(repo_id=repo_id, filename="embedding/model_int8.onnx")
        classification_model_path = hf_hub_download(repo_id=repo_id, filename="classification/model_int8.onnx")

        # Single-threaded sessions: keeps onnxruntime's internal thread
        # pool/arena overhead down on a memory-constrained free instance.
        sess_options = ort.SessionOptions()
        sess_options.intra_op_num_threads = 1
        sess_options.inter_op_num_threads = 1

        self.embedding_session = ort.InferenceSession(embedding_model_path, sess_options=sess_options)
        self.classification_session = ort.InferenceSession(classification_model_path, sess_options=sess_options)

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

    def _classify(self, onnx_inputs: dict) -> tuple[str, float]:
        input_names = [i.name for i in self.classification_session.get_inputs()]
        filtered_inputs = {k: v for k, v in onnx_inputs.items() if k in input_names}
        outputs = self.classification_session.run(None, filtered_inputs)
        logits = outputs[0]

        probs = np.exp(logits) / np.exp(logits).sum(axis=-1, keepdims=True)
        pred_idx = int(np.argmax(probs, axis=-1)[0])
        label = ID2LABEL[pred_idx].upper()
        confidence = float(probs[0][pred_idx])
        return label, confidence

    def _embed(self, onnx_inputs: dict) -> np.ndarray:
        input_names = [i.name for i in self.embedding_session.get_inputs()]
        filtered_inputs = {k: v for k, v in onnx_inputs.items() if k in input_names}
        outputs = self.embedding_session.run(None, filtered_inputs)
        last_hidden_state = outputs[0]
        cls_embedding = last_hidden_state[:, 0, :][0]
        return cls_embedding.astype(np.float32)

    def analyze(self, text: str) -> SentimentResult:
        onnx_inputs = self._tokenize(text)
        label, confidence = self._classify(onnx_inputs)
        embedding = self._embed(onnx_inputs)
        return SentimentResult(label=label, confidence=confidence, embedding=embedding)

    def analyze_batch(self, texts: list[str]) -> list[SentimentResult]:
        return [self.analyze(text) for text in texts]