import os
import numpy as np
import requests

HF_API_KEY = os.getenv("HF_API_KEY", "")
HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
HF_API_URL = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{HF_MODEL}"


def embed_text(text: str) -> list[float]:
    headers = {"Authorization": f"Bearer {HF_API_KEY}"} if HF_API_KEY else {}
    response = requests.post(HF_API_URL, headers=headers, json={"inputs": text}, timeout=30)
    response.raise_for_status()
    result = response.json()
    # API returns list of token embeddings — mean-pool to get sentence embedding
    if isinstance(result[0], list):
        embedding = np.mean(result, axis=0)
    else:
        embedding = np.array(result)
    # Normalize
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    return embedding.tolist()
