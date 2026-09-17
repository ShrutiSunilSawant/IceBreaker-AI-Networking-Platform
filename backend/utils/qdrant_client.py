import os
import uuid

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    QueryRequest,
)

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
COLLECTION = os.getenv("QDRANT_COLLECTION", "profiles")
VECTOR_SIZE = 384

client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)


def ensure_collection():
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION not in existing:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )


def store_profile(qdrant_id: str, embedding: list[float], metadata: dict):
    ensure_collection()
    client.upsert(
        collection_name=COLLECTION,
        points=[
            PointStruct(
                id=qdrant_id,
                vector=embedding,
                payload=metadata,
            )
        ],
    )


def search_similar_profiles(
    embedding: list[float],
    event_id: str,
    exclude_user_id: str,
    top_k: int = 10,
) -> list[dict]:
    ensure_collection()

    results = client.query_points(
        collection_name=COLLECTION,
        query=embedding,
        query_filter=Filter(
            must=[
                FieldCondition(key="event_id", match=MatchValue(value=event_id)),
                FieldCondition(key="active", match=MatchValue(value=True)),
            ]
        ),
        limit=top_k + 1,
        with_payload=True,
    ).points

    filtered = [
        {"score": r.score, "metadata": r.payload, "id": r.id}
        for r in results
        if r.payload.get("user_id") != exclude_user_id
    ]

    return filtered[:top_k]


def get_collection_count(event_id: str) -> int:
    ensure_collection()
    result = client.count(
        collection_name=COLLECTION,
        count_filter=Filter(
            must=[
                FieldCondition(key="event_id", match=MatchValue(value=event_id)),
                FieldCondition(key="active", match=MatchValue(value=True)),
            ]
        ),
        exact=True,
    )
    return result.count


def get_profile_embedding(user_id: str, event_id: str) -> list[float] | None:
    ensure_collection()
    results = client.scroll(
        collection_name=COLLECTION,
        scroll_filter=Filter(
            must=[
                FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                FieldCondition(key="event_id", match=MatchValue(value=event_id)),
            ]
        ),
        limit=1,
        with_vectors=True,
        with_payload=True,
    )
    points, _ = results
    if points:
        return points[0].vector
    return None


def deactivate_profile(user_id: str, event_id: str):
    ensure_collection()
    results = client.scroll(
        collection_name=COLLECTION,
        scroll_filter=Filter(
            must=[
                FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                FieldCondition(key="event_id", match=MatchValue(value=event_id)),
            ]
        ),
        limit=1,
        with_payload=True,
    )
    points, _ = results
    if points:
        point = points[0]
        updated_payload = {**point.payload, "active": False}
        client.set_payload(
            collection_name=COLLECTION,
            payload=updated_payload,
            points=[point.id],
        )

def get_profile_text(user_id: str, event_id: str) -> str:
    ensure_collection()
    results = client.scroll(
        collection_name=COLLECTION,
        scroll_filter=Filter(
            must=[
                FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                FieldCondition(key="event_id", match=MatchValue(value=event_id)),
            ]
        ),
        limit=1,
        with_payload=True,
    )
    points, _ = results
    if points:
        return points[0].payload.get("profile_text", "")
    return ""