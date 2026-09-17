import os
import redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MINUTE", 30))

r = redis.from_url(REDIS_URL, decode_responses=True)


def check_rate_limit(ip: str) -> bool:
    """
    Returns True if request is allowed, False if rate limit exceeded.
    Uses a sliding window counter per IP per minute.
    """
    key = f"rate:{ip}"
    count = r.get(key)

    if count is None:
        r.setex(key, 60, 1)
        return True

    if int(count) >= RATE_LIMIT:
        return False

    r.incr(key)
    return True


def set_user_active(user_id: str, event_id: str, active: bool = True):
    key = f"active:{event_id}:{user_id}"
    if active:
        r.set(key, "1", ex=86400)  # expires after 24 hours
    else:
        r.delete(key)


def is_user_active(user_id: str, event_id: str) -> bool:
    key = f"active:{event_id}:{user_id}"
    return r.exists(key) == 1
