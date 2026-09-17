"""
Standalone test against a running backend (no app code changes).

Verifies:
1. A user CAN register for multiple different events (already supported).
2. If a user tries to register for a second event at the same date+time as
   one they're already registered for, what actually happens today.

Run with the backend up on port 8001:
    python test_time_conflict.py
"""
import requests
import uuid

BASE = "http://127.0.0.1:8001"
RUN_ID = str(uuid.uuid4())[:8]

USER = {
    "name": "Test User",
    "email": "conflict.test@test.com",
    "role": "Engineer",
    "company": "TestCo",
    "what_you_do": "Building things and testing edge cases in networking apps, focused on backend reliability and validation logic.",
    "looking_for": "People to test conflicts with, ideally other engineers interested in QA and backend testing practices.",
    "interests": "Testing, debugging",
    "consent": True,
}

SAME_SLOT = "2026-12-01T18:00:00"


def get_token(email, event_id):
    res = requests.post(f"{BASE}/auth/token", json={"email": email, "event_id": event_id})
    res.raise_for_status()
    return res.json()["access_token"]


def create_event(name, date):
    res = requests.post(f"{BASE}/events/", json={
        "name": name,
        "date": date,
        "organizer_email": "organizer@test.com",
        "location": "Test City",
        "description": "Test event",
        "min_pool_size": 2,
    })
    res.raise_for_status()
    return res.json()["id"]


def register(event_id):
    token = get_token(USER["email"], event_id)
    res = requests.post(
        f"{BASE}/profiles/",
        json={**USER, "event_id": event_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    return res.status_code, res.json()


def main():
    print("Creating two events at the SAME date/time...")
    event_a = create_event(f"Conflict Test Event A {RUN_ID}", SAME_SLOT)
    event_b = create_event(f"Conflict Test Event B {RUN_ID}", SAME_SLOT)
    print(f"  event_a = {event_a}")
    print(f"  event_b = {event_b}")

    print("\nStep 1: Register for event A")
    status_a, body_a = register(event_a)
    print(f"  status={status_a} body={body_a}")

    print("\nStep 2: Register SAME user for event B (same day/time as A)")
    status_b, body_b = register(event_b)
    print(f"  status={status_b} body={body_b}")

    print("\n--- RESULT ---")
    if status_b == 200:
        print("GAP CONFIRMED: registration for the conflicting time slot succeeded")
        print("with no warning/message. There is currently no same-day/same-time")
        print("conflict check in routers/profiles.py — this is the feature you'd")
        print("need to add if you want a conflict message shown.")
    else:
        print("Registration was blocked — a conflict check already exists.")


if __name__ == "__main__":
    main()
