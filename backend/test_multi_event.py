import requests
import json
import random

BASE = "http://127.0.0.1:8000"
random.seed(42)

EVENTS = [
    {"name": "SF AI Networking Night", "date": "2026-12-01T18:00:00", "location": "San Francisco, CA", "description": "Networking for AI engineers and founders in SF.", "min_pool_size": 2},
    {"name": "SF ML Happy Hour", "date": "2026-12-01T20:30:00", "location": "San Francisco, CA", "description": "Casual ML conversation over drinks. Same night, different crowd.", "min_pool_size": 2},
    {"name": "NYC ML Mixer", "date": "2026-12-05T19:00:00", "location": "New York, NY", "description": "ML practitioners and researchers meet in NYC.", "min_pool_size": 2},
    {"name": "AI Founders Dinner", "date": "2026-12-10T19:00:00", "location": "Palo Alto, CA", "description": "Intimate dinner for AI startup founders and investors.", "min_pool_size": 2},
    {"name": "LLM Research Meetup", "date": "2026-12-12T18:30:00", "location": "Berkeley, CA", "description": "Academic and industry researchers discuss latest in LLMs.", "min_pool_size": 2},
]

# Sarah registers for events 0, 1 (same day), 2
SARAH_EVENT_INDICES = [0, 1, 2]

SARAH = {
    "name": "Sarah Chen",
    "email": "sarah.chen@test.com",
    "role": "ML Engineer",
    "company": "Anthropic",
    "what_you_do": "I build RAG pipelines and agentic AI systems using LangGraph and vector databases. Currently working on reducing hallucinations in production LLM systems.",
    "looking_for": "Startup founders building AI products who need technical guidance",
    "interests": "Rock climbing, sci-fi novels",
    "consent": True,
}

# 30 unique people — each event gets a completely different set of 5-6
ALL_OTHERS = [
    {"name": "Raj Patel", "email": "raj.patel@test.com", "role": "Founder", "company": "LexAI", "what_you_do": "Building an AI-powered legal document analysis tool for small businesses. Non-technical founder trying to understand what is possible with current LLM technology.", "looking_for": "Technical co-founders or ML engineers interested in applied AI for legal", "interests": "Chess, hiking, cooking", "consent": True},
    {"name": "Maya Torres", "email": "maya.torres@test.com", "role": "Product Manager", "company": "Google DeepMind", "what_you_do": "Leading product strategy for foundation model APIs. Focused on developer experience and making AI tools accessible to non-ML teams inside large enterprises.", "looking_for": "Engineers or researchers who want to move into product or collaborate on AI developer tooling", "interests": "Pottery, running, jazz piano", "consent": True},
    {"name": "James Wu", "email": "james.wu@test.com", "role": "AI Researcher", "company": "Stanford NLP Group", "what_you_do": "Studying emergent reasoning in large language models. Focus on chain of thought prompting and multi-step logical deduction.", "looking_for": "Industry engineers who want to collaborate on applied research", "interests": "Bouldering, board games, Vietnamese food", "consent": True},
    {"name": "Priya Sharma", "email": "priya.sharma@test.com", "role": "Software Engineer", "company": "Stripe", "what_you_do": "Building internal ML infrastructure for fraud detection. Work with real-time data pipelines, feature stores, and model serving at scale across millions of transactions daily.", "looking_for": "Researchers or product people interested in how ML works in high-stakes financial systems", "interests": "Yoga, photography, travel", "consent": True},
    {"name": "Daniel Kim", "email": "daniel.kim@test.com", "role": "Data Scientist", "company": "Netflix", "what_you_do": "Building recommendation systems that serve 250 million users. Work on large-scale collaborative filtering, embedding models, and real-time personalization pipelines.", "looking_for": "Engineers interested in recommendation systems or researchers working on personalization at scale", "interests": "Film photography, trail running, Korean BBQ", "consent": True},
    {"name": "Aisha Johnson", "email": "aisha.johnson@test.com", "role": "AI Policy Researcher", "company": "Brookings Institution", "what_you_do": "Researching governance frameworks for large language models and autonomous AI systems. Working with policymakers to translate technical AI risks into actionable regulation.", "looking_for": "Technical AI researchers who want to engage with policy or understand the regulatory landscape", "interests": "Jazz, urban gardening, political philosophy", "consent": True},
    {"name": "Carlos Mendez", "email": "carlos.mendez@test.com", "role": "ML Engineer", "company": "OpenAI", "what_you_do": "Working on fine-tuning and RLHF pipelines for large language models. Focused on alignment techniques that improve model helpfulness without sacrificing safety.", "looking_for": "Researchers interested in alignment or engineers who want to understand how RLHF works in practice", "interests": "Salsa dancing, soccer, home brewing", "consent": True},
    {"name": "Emma Wilson", "email": "emma.wilson@test.com", "role": "Investor", "company": "Sequoia Capital", "what_you_do": "Leading AI investments at Sequoia. Looking at infrastructure, tooling, and application layer companies. Previously a software engineer at Google Brain.", "looking_for": "Technical founders building in AI infrastructure or novel application layer products", "interests": "Skiing, reading history books, cooking Italian food", "consent": True},
    {"name": "Tariq Hassan", "email": "tariq.hassan@test.com", "role": "Research Engineer", "company": "Meta AI", "what_you_do": "Building multimodal AI systems that combine vision and language. Working on the infrastructure that trains and serves large vision-language models at Meta scale.", "looking_for": "Researchers or engineers working on multimodal systems or anyone curious about how vision-language models are trained", "interests": "Photography, cricket, Arabic calligraphy", "consent": True},
    {"name": "Sofia Rossi", "email": "sofia.rossi@test.com", "role": "CTO", "company": "HealthAI", "what_you_do": "Building AI systems for early disease detection using medical imaging and patient history. Navigating FDA approval processes for AI-based diagnostic tools.", "looking_for": "ML engineers with healthcare experience or investors who understand the regulatory complexity of medical AI", "interests": "Pilates, cooking, reading medical journals", "consent": True},
    {"name": "Kevin Park", "email": "kevin.park@test.com", "role": "Robotics Engineer", "company": "Boston Dynamics", "what_you_do": "Developing reinforcement learning systems for robot locomotion and manipulation. Bridging the gap between simulated training environments and real-world robot deployment.", "looking_for": "ML researchers interested in embodied AI or founders building in the physical AI space", "interests": "Weightlifting, K-drama, building mechanical keyboards", "consent": True},
    {"name": "Nina Patel", "email": "nina.patel@test.com", "role": "AI Ethics Lead", "company": "Microsoft", "what_you_do": "Leading responsible AI initiatives at Microsoft. Developing internal tools and frameworks to audit models for bias, fairness, and transparency across product teams.", "looking_for": "Engineers who care about fairness in ML systems or researchers working on interpretability and explainability", "interests": "Bharatanatyam dance, reading fiction, volunteering", "consent": True},
    {"name": "Leo Zhang", "email": "leo.zhang@test.com", "role": "Quantitative Researcher", "company": "Two Sigma", "what_you_do": "Applying machine learning to financial markets. Building predictive models for asset pricing and portfolio optimization using alternative data sources.", "looking_for": "ML engineers curious about quantitative finance or researchers interested in time series and probabilistic modeling", "interests": "Go, classical piano, competitive cycling", "consent": True},
    {"name": "Fatima Al-Rashid", "email": "fatima.alrashid@test.com", "role": "NLP Engineer", "company": "Hugging Face", "what_you_do": "Building and fine-tuning open source language models. Maintaining popular model repositories and contributing to the Transformers library used by millions of developers.", "looking_for": "Researchers who want to collaborate on open source models or engineers new to NLP who want mentorship", "interests": "Calligraphy, hiking, Arabic poetry", "consent": True},
    {"name": "Omar Sheikh", "email": "omar.sheikh@test.com", "role": "ML Platform Engineer", "company": "Uber", "what_you_do": "Building the internal ML platform that powers Uber's demand forecasting, surge pricing, and driver matching systems. Focus on model serving infrastructure at massive scale.", "looking_for": "Engineers interested in ML infrastructure or product people thinking about real-time AI systems", "interests": "Basketball, cooking Pakistani food, reading biographies", "consent": True},
    {"name": "Lena Fischer", "email": "lena.fischer@test.com", "role": "Computer Vision Engineer", "company": "Waymo", "what_you_do": "Building perception systems for autonomous vehicles. Working on 3D object detection and scene understanding using LiDAR and camera sensor fusion.", "looking_for": "Robotics researchers or ML engineers curious about how autonomous driving perception actually works in production", "interests": "Rock climbing, photography, hiking in the Alps", "consent": True},
    {"name": "Andre Baptiste", "email": "andre.baptiste@test.com", "role": "AI Product Lead", "company": "Salesforce", "what_you_do": "Leading the Einstein AI product team. Building AI features for CRM that help sales teams prioritize leads and automate follow-ups using LLMs and predictive models.", "looking_for": "ML engineers with enterprise software experience or founders building B2B AI products", "interests": "Jazz trumpet, cycling, French cuisine", "consent": True},
    {"name": "Yuki Tanaka", "email": "yuki.tanaka@test.com", "role": "Research Scientist", "company": "DeepMind", "what_you_do": "Researching reinforcement learning from human feedback and its application to safe AI systems. Working on the theoretical foundations of reward modeling.", "looking_for": "Engineers who want to understand the practical side of RLHF or researchers working on AI safety", "interests": "Origami, competitive chess, hiking", "consent": True},
    {"name": "Marcus Webb", "email": "marcus.webb@test.com", "role": "Data Engineer", "company": "Airbnb", "what_you_do": "Building the data infrastructure that powers Airbnb's pricing and search ranking models. Work on petabyte-scale data pipelines and feature engineering for real-time ML systems.", "looking_for": "ML engineers who want to understand data infrastructure or anyone building data-intensive products", "interests": "Surfing, jazz, cooking Caribbean food", "consent": True},
    {"name": "Zara Ahmed", "email": "zara.ahmed@test.com", "role": "Founder", "company": "EduAI", "what_you_do": "Building personalized AI tutoring systems for K-12 students. Using adaptive learning algorithms to customize curriculum and pacing based on individual student performance data.", "looking_for": "ML engineers with education technology experience or investors interested in AI for social impact", "interests": "Teaching, reading, distance running", "consent": True},
    {"name": "Chen Wei", "email": "chen.wei@test.com", "role": "MLOps Engineer", "company": "LinkedIn", "what_you_do": "Managing the ML lifecycle for LinkedIn's feed ranking and job recommendation systems. Building tooling for model monitoring, A/B testing, and automated retraining pipelines.", "looking_for": "ML engineers interested in production systems or researchers thinking about how models behave after deployment", "interests": "Table tennis, cooking Sichuan food, reading sci-fi", "consent": True},
    {"name": "Isabel Moreno", "email": "isabel.moreno@test.com", "role": "AI Researcher", "company": "MIT CSAIL", "what_you_do": "Researching causal inference methods for machine learning. Working on how models can reason about cause and effect rather than just correlation in healthcare and policy domains.", "looking_for": "Industry engineers who want to apply causal methods or researchers interested in bridging academic and applied ML", "interests": "Flamenco dancing, reading philosophy, hiking", "consent": True},
    {"name": "David Okafor", "email": "david.okafor@test.com", "role": "Founder", "company": "AgriAI", "what_you_do": "Using computer vision and satellite imagery to help smallholder farmers in West Africa predict crop yields and detect disease early. Building for low-bandwidth mobile environments.", "looking_for": "Computer vision engineers or impact investors interested in AI for agriculture in emerging markets", "interests": "Football, drumming, learning Yoruba", "consent": True},
    {"name": "Petra Novak", "email": "petra.novak@test.com", "role": "Security Engineer", "company": "Cloudflare", "what_you_do": "Building ML systems to detect DDoS attacks and bot traffic at internet scale. Working on anomaly detection and adversarial robustness for security-critical AI systems.", "looking_for": "ML engineers interested in adversarial robustness or anyone thinking about AI security", "interests": "Rock climbing, reading mystery novels, learning Czech", "consent": True},
    {"name": "Samuel Torres", "email": "samuel.torres@test.com", "role": "Climate Data Scientist", "company": "ClimateAI", "what_you_do": "Building ML models to predict extreme weather events and help companies manage climate risk. Using physics-informed neural networks and historical climate data.", "looking_for": "ML engineers interested in climate applications or investors thinking about climate tech", "interests": "Surfing, hiking, cooking Peruvian food", "consent": True},
    {"name": "Amara Diallo", "email": "amara.diallo@test.com", "role": "NLP Researcher", "company": "AI2", "what_you_do": "Working on multilingual NLP and low-resource language modeling. Building systems that work well for African and Southeast Asian languages that are underrepresented in training data.", "looking_for": "Engineers who care about language diversity in AI or researchers working on inclusive NLP", "interests": "Drumming, learning Wolof, reading African literature", "consent": True},
    {"name": "Victor Huang", "email": "victor.huang@test.com", "role": "Quantitative Analyst", "company": "Citadel", "what_you_do": "Applying deep learning to high-frequency trading signal generation. Building models that process alternative data sources like satellite imagery, credit card transactions, and news sentiment.", "looking_for": "ML researchers interested in finance applications or engineers curious about high-frequency data systems", "interests": "Go, piano, competitive swimming", "consent": True},
    {"name": "Rachel Kim", "email": "rachel.kim@test.com", "role": "Head of AI", "company": "Notion", "what_you_do": "Leading AI integration across Notion's product. Building LLM-powered features for document summarization, auto-completion, and knowledge graph construction from user notes.", "looking_for": "ML engineers with product sense or founders thinking about how to integrate AI into productivity tools", "interests": "Pottery, reading, cooking Korean food", "consent": True},
    {"name": "Benjamin Osei", "email": "benjamin.osei@test.com", "role": "AI Infrastructure Engineer", "company": "Cohere", "what_you_do": "Building the distributed training infrastructure for large language models. Working on efficient GPU memory management, gradient checkpointing, and multi-node training coordination.", "looking_for": "ML engineers interested in training infrastructure or researchers who want to understand what happens under the hood when training LLMs", "interests": "Football, drumming, learning to cook Ghanaian food", "consent": True},
    {"name": "Mei Lin", "email": "mei.lin@test.com", "role": "Product Designer", "company": "Figma", "what_you_do": "Designing AI-powered features for Figma. Working on how to make generative AI useful and trustworthy for professional designers who are skeptical of AI replacing their craft.", "looking_for": "ML engineers who care about human-AI interaction or product people thinking about AI UX", "interests": "Illustration, pottery, hiking", "consent": True},
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

    # Create 5 events
    print("\nCreating 5 events...")
    created = []
    for e in EVENTS:
        result = create_event(e)
        created.append(result)
        print(f"  {result['name']} ({result['date'][5:10]} {result['date'][11:16]}) → {result['id'][:35]}...")

    # Register Sarah for events 0, 1 (same day different time), 2
    print(f"\nRegistering Sarah for events: SF Night, SF Happy Hour, NYC Mixer...")
    sarah_tokens = {}
    sarah_ids = {}
    for idx in SARAH_EVENT_INDICES:
        event = created[idx]
        token = get_token(SARAH["email"], event["id"])
        result = submit_profile(SARAH, event["id"], token)
        sarah_tokens[event["id"]] = token
        sarah_ids[event["id"]] = result.get("user_id")
        print(f"  {event['name']} — {'OK' if result.get('stored') else f'FAILED: {result}'}")

    # Assign completely unique people to each event — no overlap
    shuffled = ALL_OTHERS.copy()
    random.shuffle(shuffled)

    # Each event gets 5-6 people, all unique across events
    event_attendees = {}
    pointer = 0
    for i, event in enumerate(created):
        count = random.randint(5, 6)
        event_attendees[event["id"]] = shuffled[pointer:pointer + count]
        pointer += count

    # Register attendees
    print(f"\nSeeding unique attendees per event (5-6 each, no overlap)...")
    for event in created:
        attendees = event_attendees[event["id"]]
        print(f"\n  {event['name']} ({len(attendees)} people):")
        for p in attendees:
            token = get_token(p["email"], event["id"])
            result = submit_profile(p, event["id"], token)
            print(f"    {p['name']} ({p['role']}) — {'OK' if result.get('stored') else 'FAILED'}")

    # Show Sarah's matches
    print("\n" + "=" * 60)
    print("SARAH'S MATCHES")
    print("=" * 60)

    for idx in SARAH_EVENT_INDICES:
        event = created[idx]
        eid = event["id"]
        print(f"\n{event['name']} — {event['date'][5:10]} {event['date'][11:16]}")
        print(f"Attendees: {', '.join(p['name'] for p in event_attendees[eid])}")

        match = find_match(sarah_ids[eid], eid, sarah_tokens[eid])

        if match.get("top_matches"):
            print(f"\n  Top {len(match['top_matches'])} matches:")
            for i, m in enumerate(match["top_matches"]):
                print(f"    #{i+1} {m['name']} ({m['role']}) — {m['match_percentage']}%")
            print(f"\n  Questions for {match['top_matches'][0]['name']}:")
            for i, q in enumerate(match["questions"], 1):
                print(f"    {i}. {q}")
        elif match.get("waiting"):
            print(f"  Waiting: {match['message']}")
        else:
            print(f"  Error: {json.dumps(match, indent=2)}")

    print("\n" + "=" * 60)
    print("Events Sarah did NOT register for:")
    for idx in range(len(created)):
        if idx not in SARAH_EVENT_INDICES:
            event = created[idx]
            print(f"  {event['name']} — attendees: {', '.join(p['name'] for p in event_attendees[event['id']])}")
    print("=" * 60)
    print("\nDone. Log in at http://localhost:5173/login with sarah.chen@test.com")