"""
FinBERT sentiment wrapper -- calls Hugging Face's hosted Inference API
instead of running the model locally. This keeps this service's own
memory footprint small enough for free-tier hosting: no local torch or
transformers runtime, no model weights held in this process's RAM.

Two HTTP calls per request, since one endpoint call doesn't give us both:
  1. text-classification  -> sentiment label + confidence
  2. feature-extraction   -> hidden states, from which we take the CLS
     token (index 0) as the embedding the risk classifier expects.

Interface matches what app/routers/analyze.py expects:
  - analyze(text) -> SentimentResult (single)
  - analyze_batch(texts) -> list[SentimentResult]
"""

import os
import time
from dataclasses import dataclass

import numpy as np
import requests

FINBERT_REPO_ID = os.getenv("FINBERT_REPO_ID", "Lakshya-Sahu47/c2c-finbert-risk")
HF_TOKEN = os.getenv("HF_TOKEN")  # required in practice -- unauthenticated
                                   # calls are heavily rate-limited and slow

HF_API_BASE = "https://api-inference.huggingface.co/models"
_HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

_MAX_RETRIES = 6
_RETRY_WAIT_SECONDS = 5  # a cold model on the free serverless tier can take
                          # 20-30s to spin up; it replies 503 while loading


@dataclass
class SentimentResult:
    label: str
    confidence: float
    embedding: np.ndarray


def _post_with_retries(url: str, payload: dict) -> requests.Response:
    response = None
    for _ in range(_MAX_RETRIES):
        response = requests.post(url, headers=_HEADERS, json=payload, timeout=30)
        if response.status_code != 503:
            return response
        time.sleep(_RETRY_WAIT_SECONDS)
    return response


class SentimentService:
    def __init__(self, repo_id: str = FINBERT_REPO_ID):
        self.repo_id = repo_id
        self.api_url = f"{HF_API_BASE}/{repo_id}"

    def _classify(self, text: str) -> tuple[str, float]:
        response = _post_with_retries(
            self.api_url, {"inputs": text, "options": {"wait_for_model": True}}
        )
        response.raise_for_status()
        data = response.json()
        scores = data[0] if isinstance(data, list) and isinstance(data[0], list) else data
        top = max(scores, key=lambda s: s["score"])
        return top["label"].upper(), float(top["score"])

    def _embed(self, text: str) -> np.ndarray:
        response = _post_with_retries(
            self.api_url,
            {
                "inputs": text,
                "options": {"wait_for_model": True},
                "parameters": {"pooling": "none"},
            },
        )
        response.raise_for_status()
        vectors = response.json()
        # Shape for a single input: [tokens, hidden_dim] -- CLS token is index 0.
        cls_vector = np.array(vectors[0], dtype=np.float32)
        return cls_vector

    def analyze(self, text: str) -> SentimentResult:
        label, confidence = self._classify(text)
        embedding = self._embed(text)
        return SentimentResult(label=label, confidence=confidence, embedding=embedding)

    def analyze_batch(self, texts: list[str]) -> list[SentimentResult]:
        return [self.analyze(text) for text in texts]