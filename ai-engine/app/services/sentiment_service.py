"""
FinBERT sentiment wrapper.

Loads tokenizer + model straight from the Hugging Face repo (public repo,
so no token needed). transformers handles the download + local caching
automatically -- no manual file management required.

Interface matches what app/routers/analyze.py expects:
  - analyze(text) -> SentimentResult (single)
  - analyze_batch(texts) -> list[SentimentResult]
"""

import os
from dataclasses import dataclass

import numpy as np
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

FINBERT_REPO_ID = os.getenv("FINBERT_REPO_ID", "Lakshya-Sahu47/c2c-finbert-risk")


@dataclass
class SentimentResult:
    label: str
    confidence: float
    embedding: np.ndarray


class SentimentService:
    def __init__(self, repo_id: str = FINBERT_REPO_ID):
        # Force CPU + single-threaded: this runs on memory-constrained
        # free-tier hosting, not a GPU box.
        self.device = torch.device("cpu")
        torch.set_num_threads(1)

        self.tokenizer = AutoTokenizer.from_pretrained(repo_id)
        # low_cpu_mem_usage avoids briefly holding two copies of the
        # weights in RAM during load.
        self.model = AutoModelForSequenceClassification.from_pretrained(
            repo_id, low_cpu_mem_usage=True
        )
        self.model.to(self.device)
        self.model.eval()

        # Dynamic int8 quantization cuts the model's weight memory ~4x
        # vs full float32 -- needed to fit inside a 512MB free instance.
        self.model = torch.quantization.quantize_dynamic(
            self.model, {torch.nn.Linear}, dtype=torch.qint8
        )

        # Use the model's own label mapping -- never hardcode label order.
        self.id2label = self.model.config.id2label

    def _predict_batch(self, texts: list[str]) -> list[SentimentResult]:
        inputs = self.tokenizer(
            texts, return_tensors="pt", truncation=True, padding=True, max_length=64,
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs, output_hidden_states=True)

        probs = F.softmax(outputs.logits, dim=-1)
        cls_embeddings = outputs.hidden_states[-1][:, 0, :].cpu().numpy()

        results = []
        for i in range(len(texts)):
            top_idx = int(torch.argmax(probs[i]).item())
            label = self.id2label[top_idx].upper()
            confidence = float(probs[i][top_idx].item())
            results.append(
                SentimentResult(
                    label=label,
                    confidence=confidence,
                    embedding=cls_embeddings[i],
                )
            )
        return results

    def analyze(self, text: str) -> SentimentResult:
        return self._predict_batch([text])[0]

    def analyze_batch(self, texts: list[str]) -> list[SentimentResult]:
        return self._predict_batch(texts)