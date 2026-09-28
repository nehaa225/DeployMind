import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.db.database import Base, HindsightMemory
from backend.memory.hindsight_store import HindsightStore
from backend.agents.deployment_analyzer import deployment_analyzer_agent
from backend.agents.memory_agent import memory_agent
from backend.agents.risk_agent import risk_agent
from backend.agents.learning_agent import learning_agent

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_hindsight_retain_and_recall(db_session):
    store = HindsightStore(db_session)
    
    # 1. Retain incident
    incident = {
        "id": "DEP-017",
        "service": "payment-api",
        "version": "v2.3.0",
        "commit_sha": "91a82f",
        "environment": "production",
        "changes_summary": "Database schema migration + Redis update",
        "database_change": True,
        "redis_change": True,
        "infra_change": False,
        "status": "FAILED",
        "failure_type": "MIGRATION_LOCK",
        "symptoms": "API connection pool exhaustion",
        "root_cause": "Unindexed migration lock under load",
        "resolution": "Rollback schema migration",
        "lessons": "Validate migration lock before production.",
        "tags": ["database", "migration", "payment"]
    }
    retained = store.retain(incident)
    assert retained["id"] == "DEP-017"
    assert retained["status"] == "FAILED"

    # 2. Recall with similar spec
    target_spec = {
        "service": "payment-api",
        "database_change": True,
        "redis_change": True,
        "infra_change": False,
        "environment": "production",
        "changes_summary": "Database migration and payment API refactor"
    }
    recalled = store.recall(target_spec, top_k=5)
    assert len(recalled) == 1
    assert recalled[0]["memory_id"] == "DEP-017"
    assert recalled[0]["similarity_pct"] >= 75.0

def test_four_agents_pipeline(db_session):
    store = HindsightStore(db_session)
    
    # Pre-seed incident
    store.retain({
        "id": "DEP-017",
        "service": "payment-api",
        "database_change": True,
        "redis_change": True,
        "status": "FAILED",
        "root_cause": "Migration connection lock",
        "resolution": "Rollback migration",
        "lessons": "Validate database migration with dry-run."
    })

    raw_input = {
        "service": "payment-api",
        "version": "v2.4.1",
        "commit_sha": "a82f91",
        "files_changed": 17,
        "database_change": True,
        "redis_change": True,
        "environment": "production",
        "changes_summary": "Database migration and Redis config"
    }

    # Agent 1
    spec = deployment_analyzer_agent.analyze(raw_input)
    assert spec["service"] == "payment-api"

    # Agent 2
    mem_result = memory_agent.recall_memories(db_session, spec)
    assert mem_result["total_recalled"] == 1
    assert "I've seen this deployment before" in mem_result["hero_headline"]

    # Agent 3
    risk_res = risk_agent.evaluate_risk(spec, mem_result)
    assert risk_res["risk_level"] == "HIGH"
    assert len(risk_res["recommendations"]) > 0

    # Agent 4
    outcome_payload = {
        "status": "SUCCESS",
        "lessons": "Staging validation prevented database migration deadlock."
    }
    learned = learning_agent.learn_from_outcome(db_session, spec, outcome_payload)
    assert learned["learning_complete"] is True
