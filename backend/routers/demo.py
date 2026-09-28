from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.db.database import get_db, HindsightMemory
from backend.memory.hindsight_store import HindsightStore
from backend.agents.deployment_analyzer import deployment_analyzer_agent
from backend.agents.memory_agent import memory_agent
from backend.agents.risk_agent import risk_agent
from backend.agents.learning_agent import learning_agent

router = APIRouter(prefix="/demo", tags=["demo"])

SAMPLE_DEPLOYMENT = {
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

@router.post("/scene/1")
def execute_scene_1(db: Session = Depends(get_db)):
    """
    Scene 1 — Empty Memory (Cold Start)
    Clears memories, then runs analysis. Expects NO historical matches.
    """
    db.query(HindsightMemory).delete()
    db.commit()

    analyzed = deployment_analyzer_agent.analyze(SAMPLE_DEPLOYMENT)
    recalled = memory_agent.recall_memories(db, analyzed)
    risk_output = risk_agent.evaluate_risk(analyzed, recalled)

    return {
        "scene": 1,
        "title": "Scene 1 — Empty Memory (Cold Start)",
        "description": "DeployMind has zero stored deployment experience. It performs standard analysis without historical backing.",
        "memory_count": 0,
        "analyzed_spec": analyzed,
        "memory_recalled": recalled,
        "risk_assessment": risk_output
    }

@router.post("/scene/2")
def execute_scene_2(db: Session = Depends(get_db)):
    """
    Scene 2 — Build Memory (Incident Retention)
    Simulates a failure deployment experience (DEP-017) and stores root cause & lesson.
    """
    store = HindsightStore(db)

    incident_1 = {
        "id": "DEP-017",
        "service": "payment-api",
        "version": "v2.3.0",
        "commit_sha": "91a82f",
        "environment": "production",
        "changes_summary": "Database schema migration adding idempotency keys + Payment API refactor + Redis caching",
        "database_change": True,
        "redis_change": True,
        "infra_change": False,
        "status": "FAILED",
        "failure_type": "MIGRATION_LOCK",
        "symptoms": "API connection pool exhaustion, HTTP 504 gateway timeouts, database migration lock held > 45s",
        "root_cause": "Unindexed migration ALTER TABLE lock on payment_intents table under peak traffic",
        "resolution": "Immediate rollback of schema migration + restart of payment-api pods",
        "lessons": "Always validate database migration locks with staging dry-run before production rollout.",
        "tags": ["database", "migration", "payment", "production", "failure"]
    }

    incident_2 = {
        "id": "DEP-031",
        "service": "payment-api",
        "version": "v2.3.5",
        "commit_sha": "b82f91",
        "environment": "production",
        "changes_summary": "Updated Redis caching cluster configuration & TTL settings for payment sessions",
        "database_change": False,
        "redis_change": True,
        "infra_change": True,
        "status": "FAILED",
        "failure_type": "CONFIG_MISMATCH",
        "symptoms": "Redis GET failures, missing auth tokens, cached payment state corruption",
        "root_cause": "Incompatible Redis cluster TLS configuration string format",
        "resolution": "Reverted Redis configuration setting to v6 format",
        "lessons": "Run Redis integration compatibility test suite against target Redis cluster version.",
        "tags": ["redis", "configuration", "payment", "production", "failure"]
    }

    res1 = store.retain(incident_1)
    res2 = store.retain(incident_2)

    return {
        "scene": 2,
        "title": "Scene 2 — Build Memory (Incident Retention)",
        "description": "DeployMind retained 2 past failure experiences with root causes and effective resolutions.",
        "retained_incidents": [res1, res2],
        "total_memories": store.get_stats()["total_memories"]
    }

@router.post("/scene/3")
def execute_scene_3(db: Session = Depends(get_db)):
    """
    Scene 3 — The Magic Moment ("I've seen this deployment before!")
    Submits deployment v2.4.1 again. DeployMind recalls past failures (91% similarity),
    flags HIGH RISK, and recommends prevention.
    """
    analyzed = deployment_analyzer_agent.analyze(SAMPLE_DEPLOYMENT)
    recalled = memory_agent.recall_memories(db, analyzed)
    risk_output = risk_agent.evaluate_risk(analyzed, recalled)

    return {
        "scene": 3,
        "title": "Scene 3 — The Magic Moment ('I've seen this deployment before')",
        "description": "DeployMind matches target deployment with historical failure DEP-017 (91% similarity), flags HIGH RISK, and provides preventive steps.",
        "analyzed_spec": analyzed,
        "memory_recalled": recalled,
        "risk_assessment": risk_output
    }
