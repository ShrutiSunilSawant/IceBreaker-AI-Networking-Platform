from typing import TypedDict, Optional


class IcebreakerState(TypedDict):
    # Profile intake
    raw_input: dict                    # Raw form data from user
    user_id: str                       # Hashed user identifier
    email_hash: str                    # Hashed email, stable across events
    event_id: str                      # Event this profile belongs to
    sanitized_profile: dict            # Cleaned, validated profile text

    # Validation
    validation_passed: bool
    validation_error: Optional[str]

    # Duplicate check
    is_duplicate: bool

    # Moderation
    moderation_passed: bool
    moderation_reason: Optional[str]

    # Embedding + storage
    embedding: Optional[list[float]]
    qdrant_id: Optional[str]
    stored: bool

    # Matching
    candidate_profiles: list[dict]     # Top-k from Qdrant
    matched_profile: Optional[dict]    # Final selected match
    match_score: Optional[float]

    # Pool check
    pool_size: int
    pool_ready: bool

    # Question generation
    icebreaker_questions: list[str]
    retry_count: int

    # Quality check
    quality_score: Optional[float]
    quality_passed: bool

    # Repetition check
    questions_are_unique: bool

    # Output
    final_output: Optional[dict]

    # Feedback
    feedback_rating: Optional[int]     # 1 = thumbs up, 0 = thumbs down
    match_id: Optional[str]
