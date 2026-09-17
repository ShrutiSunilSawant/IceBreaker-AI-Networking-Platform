from sentence_transformers import SentenceTransformer

# Loads once at startup, runs locally, completely free
_model = SentenceTransformer("all-MiniLM-L6-v2")


def embed_text(text: str) -> list[float]:
    """
    Convert a text string into a vector embedding.
    Uses all-MiniLM-L6-v2: fast, small, good quality for semantic similarity.
    Returns a list of 384 floats.
    """
    embedding = _model.encode(text, normalize_embeddings=True)
    return embedding.tolist()
