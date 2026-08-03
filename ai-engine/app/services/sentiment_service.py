"""
FinBERT sentiment wrapper -- calls Hugging Face's hosted Inference API via
the official huggingface_hub client, instead of running the model locally.
This keeps this service's own memory footprint small enough for free-tier
hosting: no local torch/transformers runtime, no model weights held in
this process's RAM.

Using InferenceClient (rather than hand-built HTTP requests to a specific
endpoint URL) matters here: Hugging Face has been actively migrating its
serverless inference routing, and the client library tracks that so we
don't have to hardcode a URL that might change again.

Interface matches what app/routers/analyze.py expects:
  - analyze(text) -> SentimentResult (single)
  - analyze_batch(texts) -> list[SentimentResult]
"""

import os
from dataclasses import dataclass

import numpy as np
from huggingface_hub import InferenceClient

FINBERT_REPO_ID = os.getenv("FINBERT_REPO_ID", "Lakshya-Sahu47/c2c-finbert-risk")
HF_TOKEN = os.getenv("HF_TOKEN")


@dataclass
class SentimentResult:
    label: str
    confidence: float
    embedding: np.ndarray


class SentimentService:
    def __init__(self, repo_id: str = FINBERT_REPO_ID):
        self.repo_id = repo_id
        self.client = InferenceClient(token=HF_TOKEN, provider="hf-inference")

    def _classify(self, text: str) -> tuple[str, float]:
        results = self.client.text_classification(text, model=self.repo_id)
        # results is a list of {"label": ..., "score": ...}, sorted by score
        # already, but take the max explicitly to not depend on that.
        top = max(results, key=lambda r: r.score)
        return top.label.upper(), float(top.score)

    def _embed(self, text: str) -> np.ndarray:
        # feature_extraction returns token-level hidden states for a single
        # input as a [tokens, hidden_dim] array -- CLS token is index 0.
        vectors = self.client.feature_extraction(text, model=self.repo_id)
        return np.array(vectors[0], dtype=np.float32)

    def analyze(self, text: str) -> SentimentResult:
        label, confidence = self._classify(text)
        embedding = self._embed(text)
        return SentimentResult(label=label, confidence=confidence, embedding=embedding)

    def analyze_batch(self, texts: list[str]) -> list[SentimentResult]:
        return [self.analyze(text) for text in texts]