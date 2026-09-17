import requests
import json
import random

BASE = "http://127.0.0.1:8001"
random.seed(7)

EVENTS = [
    {
        "name": "SF AI Networking Night",
        "date": "2026-08-01T18:00:00",
        "location": "San Francisco, CA",
        "description": "Networking for AI engineers and founders in SF.",
        "min_pool_size": 2,
        "organizer_email": "organizer@test.com",
    },
    {
        "name": "NYC ML Mixer",
        "date": "2026-08-05T19:00:00",
        "location": "New York, NY",
        "description": "ML practitioners and researchers meet in NYC.",
        "min_pool_size": 2,
        "organizer_email": "organizer@test.com",
    },
    {
        "name": "AI Founders Dinner",
        "date": "2026-08-10T19:00:00",
        "location": "Palo Alto, CA",
        "description": "Intimate dinner for AI startup founders and investors.",
        "min_pool_size": 2,
        "organizer_email": "organizer@test.com",
    },
]

# 15 unique people — 5 per event, no overlap
ALL_ATTENDEES = [
    # Event 1 — SF AI Networking Night
    {
        "name": "Raj Patel",
        "email": "raj.patel@test.com",
        "role": "Founder",
        "company": "LexAI",
        "what_you_do": "Building an AI-powered legal document analysis tool for small businesses. Non-technical founder learning what is possible with current LLM technology.",
        "looking_for": "Technical co-founders or ML engineers interested in applied AI for legal",
        "interests": "Chess, hiking, cooking",
        "consent": True,
    },
    {
        "name": "Maya Torres",
        "email": "maya.torres@test.com",
        "role": "Product Manager",
        "company": "Google DeepMind",
        "what_you_do": "Leading product strategy for foundation model APIs. Focused on developer experience and making AI tools accessible to non-ML teams inside large enterprises.",
        "looking_for": "Engineers or researchers who want to move into product roles or collaborate on AI developer tooling",
        "interests": "Pottery, running, jazz piano",
        "consent": True,
    },
    {
        "name": "James Wu",
        "email": "james.wu@test.com",
        "role": "AI Researcher",
        "company": "Stanford NLP Group",
        "what_you_do": "Studying emergent reasoning in large language models. Focus on chain of thought prompting and how models handle multi-step logical deduction.",
        "looking_for": "Industry engineers who want to collaborate on applied research or turn academic findings into real products",
        "interests": "Bouldering, board games, Vietnamese food",
        "consent": True,
    },
    {
        "name": "Priya Sharma",
        "email": "priya.sharma@test.com",
        "role": "Software Engineer",
        "company": "Stripe",
        "what_you_do": "Building internal ML infrastructure for fraud detection. Work with real-time data pipelines, feature stores, and model serving at scale across millions of transactions daily.",
        "looking_for": "Researchers or product people interested in how ML works in high-stakes financial systems",
        "interests": "Yoga, photography, travel",
        "consent": True,
    },
    {
        "name": "Daniel Kim",
        "email": "daniel.kim@test.com",
        "role": "Data Scientist",
        "company": "Netflix",
        "what_you_do": "Building recommendation systems that serve 250 million users. Work on large-scale collaborative filtering, embedding models, and real-time personalization pipelines.",
        "looking_for": "Engineers interested in recommendation systems or researchers working on personalization at scale",
        "interests": "Film photography, trail running, Korean BBQ",
        "consent": True,
    },

    # Event 2 — NYC ML Mixer
    {
        "name": "Aisha Johnson",
        "email": "aisha.johnson@test.com",
        "role": "AI Policy Researcher",
        "company": "Brookings Institution",
        "what_you_do": "Researching governance frameworks for large language models and autonomous AI systems. Working with policymakers to translate technical AI risks into actionable regulation.",
        "looking_for": "Technical AI researchers who want to engage with policy or understand the regulatory landscape",
        "interests": "Jazz, urban gardening, political philosophy",
        "consent": True,
    },
    {
        "name": "Carlos Mendez",
        "email": "carlos.mendez@test.com",
        "role": "ML Engineer",
        "company": "OpenAI",
        "what_you_do": "Working on fine-tuning and RLHF pipelines for large language models. Focused on alignment techniques that improve model helpfulness without sacrificing safety.",
        "looking_for": "Researchers interested in alignment or engineers who want to understand how RLHF works in practice",
        "interests": "Salsa dancing, soccer, home brewing",
        "consent": True,
    },
    {
        "name": "Emma Wilson",
        "email": "emma.wilson@test.com",
        "role": "Investor",
        "company": "Sequoia Capital",
        "what_you_do": "Leading AI investments at Sequoia. Looking at infrastructure, tooling, and application layer companies. Previously a software engineer at Google Brain.",
        "looking_for": "Technical founders building in AI infrastructure or novel application layer products",
        "interests": "Skiing, reading history books, cooking Italian food",
        "consent": True,
    },
    {
        "name": "Tariq Hassan",
        "email": "tariq.hassan@test.com",
        "role": "Research Engineer",
        "company": "Meta AI",
        "what_you_do": "Building multimodal AI systems that combine vision and language. Working on the infrastructure that trains and serves large vision-language models at Meta scale.",
        "looking_for": "Researchers or engineers working on multimodal systems or anyone curious about how vision-language models are trained",
        "interests": "Photography, cricket, Arabic calligraphy",
        "consent": True,
    },
    {
        "name": "Sofia Rossi",
        "email": "sofia.rossi@test.com",
        "role": "CTO",
        "company": "HealthAI",
        "what_you_do": "Building AI systems for early disease detection using medical imaging and patient history. Navigating FDA approval processes for AI-based diagnostic tools.",
        "looking_for": "ML engineers with healthcare experience or investors who understand the regulatory complexity of medical AI",
        "interests": "Pilates, cooking, reading medical journals",
        "consent": True,
    },

    # Event 3 — AI Founders Dinner
    {
        "name": "Kevin Park",
        "email": "kevin.park@test.com",
        "role": "Robotics Engineer",
        "company": "Boston Dynamics",
        "what_you_do": "Developing reinforcement learning systems for robot locomotion and manipulation. Bridging the gap between simulated training environments and real-world robot deployment.",
        "looking_for": "ML researchers interested in embodied AI or founders building in the physical AI space",
        "interests": "Weightlifting, K-drama, building mechanical keyboards",
        "consent": True,
    },
    {
        "name": "Nina Patel",
        "email": "nina.patel@test.com",
        "role": "AI Ethics Lead",
        "company": "Microsoft",
        "what_you_do": "Leading responsible AI initiatives at Microsoft. Developing internal tools and frameworks to audit models for bias, fairness, and transparency across product teams.",
        "looking_for": "Engineers who care about fairness in ML systems or researchers working on interpretability and explainability",
        "interests": "Bharatanatyam dance, reading fiction, volunteering",
        "consent": True,
    },
    {
        "name": "Leo Zhang",
        "email": "leo.zhang@test.com",
        "role": "Quantitative Researcher",
        "company": "Two Sigma",
        "what_you_do": "Applying machine learning to financial markets. Building predictive models for asset pricing and portfolio optimization using alternative data sources.",
        "looking_for": "ML engineers curious about quantitative finance or researchers interested in time series and probabilistic modeling",
        "interests": "Go, classical piano, competitive cycling",
        "consent": True,
    },
    {
        "name": "Fatima Al-Rashid",
        "email": "fatima.alrashid@test.com",
        "role": "NLP Engineer",
        "company": "Hugging Face",
        "what_you_do": "Building and fine-tuning open source language models. Maintaining popular model repositories and contributing to the Transformers library used by millions of developers.",
        "looking_for": "Researchers who want to collaborate on open source models or engineers new to NLP who want mentorship",
        "interests": "Calligraphy, hiking, Arabic poetry",
        "consent": True,
    },
    {
        "name": "Omar Sheikh",
        "email": "omar.sheikh@test.com",
        "role": "ML Platform Engineer",
        "company": "Uber",
        "what_you_do": "Building the internal ML platform that powers Uber's demand forecasting, surge pricing, and driver matching systems. Focus on model serving infrastructure at massive scale.",
        "looking_for": "Engineers interested in ML infrastructure or product people thinking about real-time AI systems",
        "interests": "Basketball, cooking Pakistani food, reading biographies",
        "consent": True,
    },
]


def get_token(email, event_id):
    res = requests.post(f"{BASE}/auth/token", json={"email": email, "event_id": event_id})
    res.raise_for_status()
    return res.json()["access_token"]


def submit_profile(profile, event_id, token):
    res = requests.post(
        f"{BASE}/profiles/",
        json={**profile, "event_id": event_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    return res.json()


def find_match(user_id, event_id, token):
    res = requests.post(
        f"{BASE}/matches/",
        json={"user_id": user_id, "event_id": event_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    return res.json()


def create_event(payload):
    res = requests.post(f"{BASE}/events/", json=payload)
    res.raise_for_status()
    return res.json()


if __name__ == "__main__":

    # Create 3 events
    print("\nCreating 3 events...")
    created = []
    for e in EVENTS:
        result = create_event(e)
        created.append(result)
        print(f"  {result['name']} → {result['id'][:40]}...")

    # Assign 5 unique attendees per event
    event_groups = [
        ALL_ATTENDEES[0:5],   # Event 1
        ALL_ATTENDEES[5:10],  # Event 2
        ALL_ATTENDEES[10:15], # Event 3
    ]

    print("\nRegistering attendees...")
    all_tokens = {}
    all_user_ids = {}

    for i, event in enumerate(created):
        attendees = event_groups[i]
        print(f"\n  {event['name']} ({len(attendees)} people):")
        for p in attendees:
            token = get_token(p["email"], event["id"])
            result = submit_profile(p, event["id"], token)
            key = f"{p['email']}_{event['id']}"
            all_tokens[key] = token
            all_user_ids[key] = result.get("user_id")
            status = "OK" if result.get("stored") else f"FAILED: {result}"
            print(f"    {p['name']} ({p['role']}) — {status}")

    # Test match for first person in each event
    print("\n" + "=" * 60)
    print("SAMPLE MATCHES")
    print("=" * 60)

    for i, event in enumerate(created):
        first = event_groups[i][0]
        key = f"{first['email']}_{event['id']}"
        token = all_tokens[key]
        user_id = all_user_ids[key]

        print(f"\n{event['name']}")
        print(f"Testing match for: {first['name']} ({first['role']})")
        print(f"Attendees: {', '.join(p['name'] for p in event_groups[i])}")

        match = find_match(user_id, event["id"], token)

        if match.get("top_matches"):
            print(f"\n  Top {len(match['top_matches'])} matches:")
            for j, m in enumerate(match["top_matches"]):
                print(f"    #{j+1} {m['name']} ({m['role']}) — {m['match_percentage']}%")
            print(f"\n  Questions for {match['top_matches'][0]['name']}:")
            for j, q in enumerate(match["questions"], 1):
                print(f"    {j}. {q}")
        elif match.get("waiting"):
            print(f"  Waiting: {match['message']}")
        else:
            print(f"  Error: {json.dumps(match, indent=2)}")

    print("\n" + "=" * 60)
    print("Done.")
    print("\nTo test on the site, log in at http://localhost:5173/login")
    print("Use any of these emails:")
    for p in ALL_ATTENDEES:
        print(f"  {p['email']}")
    print("=" * 60)