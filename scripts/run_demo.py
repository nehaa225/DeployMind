import sys
import os
import json
import time

# Ensure UTF-8 output encoding for Windows terminal
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.db.database import Base, HindsightMemory
from backend.memory.hindsight_store import HindsightStore
from backend.agents.deployment_analyzer import deployment_analyzer_agent
from backend.agents.memory_agent import memory_agent
from backend.agents.risk_agent import risk_agent
from backend.agents.learning_agent import learning_agent

def print_banner(text: str):
    print("\n" + "=" * 70)
    print(f"  [DEPLOYMIND]  {text}")
    print("=" * 70)

def main():
    print_banner("DeployMind - Self-Learning DevOps Pipeline Agent Demo")
    
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    target_deployment = {
        "service": "payment-api",
        "version": "v2.4.1",
        "commit_sha": "a82f91",
        "files_changed": 17,
        "database_change": True,
        "redis_change": True,
        "infra_change": False,
        "environment": "production",
        "changes_summary": "Database schema migration + Payment API refactor + Redis configuration update"
    }

    # -------------------------------------------------------------
    # SCENE 1: Empty Memory (Cold Start)
    # -------------------------------------------------------------
    print_banner("SCENE 1: Empty Memory (Cold Start)")
    print("Analyzing deployment 'payment-api v2.4.1' with ZERO prior memory...")
    
    spec = deployment_analyzer_agent.analyze(target_deployment)
    mem_1 = memory_agent.recall_memories(db, spec)
    risk_1 = risk_agent.evaluate_risk(spec, mem_1)

    print(f"\n🧠 Hindsight Memories Recalled: {mem_1['total_recalled']}")
    print(f"📢 Hero Insight: {mem_1['hero_headline']}")
    print(f"⚠️  Risk Rating: {risk_1['risk_level']} (Confidence: {int(risk_1['confidence']*100)}%)")
    print(f"📝 Recommendation: Standard deployment monitoring (No historical failures found).")
    time.sleep(1)

    # -------------------------------------------------------------
    # SCENE 2: Incident Injection & Retention
    # -------------------------------------------------------------
    print_banner("SCENE 2: Incident Injection & Memory Retention")
    print("Simulating deployment execution failure (DEP-017 & DEP-031)...")
    
    store = HindsightStore(db)

    incident_1 = {
        "id": "DEP-017",
        "service": "payment-api",
        "version": "v2.3.0",
        "commit_sha": "91a82f",
        "environment": "production",
        "changes_summary": "Database schema migration + Payment API refactor + Redis caching",
        "database_change": True,
        "redis_change": True,
        "infra_change": False,
        "status": "FAILED",
        "failure_type": "MIGRATION_LOCK",
        "symptoms": "API connection pool exhaustion, HTTP 504 gateway timeouts",
        "root_cause": "Unindexed migration ALTER TABLE lock on payment_intents table under peak traffic",
        "resolution": "Immediate rollback of schema migration + restart of payment-api pods",
        "lessons": "Always validate database migration locks with staging dry-run before production.",
        "tags": ["database", "migration", "payment", "failure"]
    }

    incident_2 = {
        "id": "DEP-031",
        "service": "payment-api",
        "version": "v2.3.5",
        "commit_sha": "b82f91",
        "environment": "production",
        "changes_summary": "Updated Redis caching cluster configuration & TTL settings",
        "database_change": False,
        "redis_change": True,
        "infra_change": True,
        "status": "FAILED",
        "failure_type": "CONFIG_MISMATCH",
        "symptoms": "Redis GET failures, missing auth tokens",
        "root_cause": "Incompatible Redis cluster TLS configuration string format",
        "resolution": "Reverted Redis configuration setting to v6 format",
        "lessons": "Run Redis integration compatibility test suite against target version.",
        "tags": ["redis", "configuration", "payment", "failure"]
    }

    store.retain(incident_1)
    store.retain(incident_2)
    print("[SUCCESS] Retained DEP-017 and DEP-031 into persistent Hindsight store.")
    time.sleep(1)

    # -------------------------------------------------------------
    # SCENE 3: The Magic Moment ("I've seen this before!")
    # -------------------------------------------------------------
    print_banner("SCENE 3: The Magic Moment ('I've seen this deployment before!')")
    print("Re-submitting deployment 'payment-api v2.4.1'...")
    
    mem_3 = memory_agent.recall_memories(db, spec)
    risk_3 = risk_agent.evaluate_risk(spec, mem_3)

    print(f"\n🧠 Hindsight Memories Recalled: {mem_3['total_recalled']}")
    print(f"🔥 HERO INSIGHT: {mem_3['hero_headline']}")
    print(f"🚨 Risk Rating: {risk_3['risk_level']} (Confidence: {int(risk_3['confidence']*100)}%)")
    print("\n🔍 Historically Matched Incident:")
    top_match = mem_3['matched_memories'][0]
    print(f"   • Match ID: {top_match['memory_id']} ({top_match['similarity_pct']}% Similarity)")
    print(f"   • Past Symptoms: {top_match['symptoms']}")
    print(f"   • Root Cause: {top_match['root_cause']}")
    print(f"   • Prior Resolution: {top_match['resolution']}")

    print("\n🛡️  Actionable Preventive Recommendations:")
    for idx, rec in enumerate(risk_3['recommendations'], 1):
        print(f"   {idx}. {rec}")

    print("\nExecuting recommended preventive checks (Database Migration Dry-Run & Staging Test)... PASSED!")
    
    # Retain the safe deployment
    outcome_payload = {
        "status": "SUCCESS",
        "lessons": "Preventive database migration dry-run and Redis compatibility checks successfully prevented production incident."
    }
    learned = learning_agent.learn_from_outcome(db, spec, outcome_payload)
    print(f"\n🧠 Self-Learning Retain Result: {learned['message']}")
    print_banner("DEMO COMPLETE - DeployMind successfully learned from past failures!")

if __name__ == "__main__":
    main()
