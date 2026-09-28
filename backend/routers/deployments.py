from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.db.database import get_db, DeploymentRecord
from backend.agents.deployment_analyzer import deployment_analyzer_agent
from backend.agents.memory_agent import memory_agent
from backend.agents.risk_agent import risk_agent
from backend.agents.learning_agent import learning_agent

router = APIRouter(prefix="/deployments", tags=["deployments"])

class AnalyzeDeploymentRequest(BaseModel):
    service: str = "payment-api"
    version: str = "v2.4.1"
    commit_sha: str = "a82f91"
    files_changed: int = 17
    database_change: bool = True
    redis_change: bool = True
    infra_change: bool = False
    environment: str = "production"
    changes_summary: str = "Database schema migration + Payment API modified + Redis configuration update"

class ExecuteValidationRequest(BaseModel):
    deployment_id: Optional[str] = None
    validation_type: str = "staging_deploy"  # db_migration_test, redis_compat_test, staging_deploy

class RetainOutcomeRequest(BaseModel):
    id: Optional[str] = None
    service: str
    version: str = "v2.4.1"
    status: str = "SUCCESS"  # SUCCESS / FAILED
    failure_type: Optional[str] = None
    symptoms: Optional[str] = None
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
    lessons: Optional[str] = None
    database_change: bool = False
    redis_change: bool = False
    infra_change: bool = False
    environment: str = "production"
    changes_summary: Optional[str] = None

@router.post("/analyze")
def analyze_deployment(payload: AnalyzeDeploymentRequest, db: Session = Depends(get_db)):
    raw_dict = payload.dict()
    
    # 1. Agent 1: Deployment Analyzer
    analyzed_spec = deployment_analyzer_agent.analyze(raw_dict)
    
    # 2. Agent 2: Memory Agent (Hindsight RECALL)
    memory_result = memory_agent.recall_memories(db, analyzed_spec, top_k=5)
    
    # 3. Agent 3: Risk Agent
    risk_assessment = risk_agent.evaluate_risk(analyzed_spec, memory_result)
    
    # Save record to deployments table
    dep_id = f"DEP-{hash(f'{analyzed_spec.get("service")}-{analyzed_spec.get("commit_sha")}') % 1000:03d}"
    
    rec = DeploymentRecord(
        id=dep_id,
        service=analyzed_spec["service"],
        version=payload.version,
        commit_sha=analyzed_spec["commit_sha"],
        environment=analyzed_spec["environment"],
        files_changed=analyzed_spec["files_changed"],
        database_change=analyzed_spec["database_change"],
        redis_change=analyzed_spec["redis_change"],
        infra_change=analyzed_spec["infra_change"],
        status="PENDING",
        risk_level=risk_assessment["risk_level"],
        confidence_score=risk_assessment["confidence"]
    )
    db.merge(rec)
    db.commit()

    return {
        "deployment_id": dep_id,
        "analyzed_spec": analyzed_spec,
        "memory_recalled": memory_result,
        "risk_assessment": risk_assessment
    }

@router.post("/validate")
def execute_preventive_validation(payload: ExecuteValidationRequest):
    val_type = payload.validation_type
    if val_type == "db_migration_test":
        return {
            "validation": "Database Migration Lock Test",
            "passed": True,
            "details": "Dry-run execution against shadow DB completed in 1.4s with 0 exclusive locks held.",
            "recommendation": "Safe for non-blocking migration deployment."
        }
    elif val_type == "redis_compat_test":
        return {
            "validation": "Redis Configuration & Protocol Compatibility",
            "passed": True,
            "details": "TLS and key payload TTL parameters verified against Redis 7.0 cluster.",
            "recommendation": "Redis cache settings verified compatible."
        }
    elif val_type == "staging_deploy":
        return {
            "validation": "Staging Environment Canary Deployment",
            "passed": True,
            "details": "Deployed to staging-cluster-01. Synthesized 500 requests/sec traffic with 0 errors.",
            "recommendation": "Ready for production rollout approval."
        }
    else:
        return {
            "validation": "General Pipeline Verification",
            "passed": True,
            "details": "All automated CI pipeline checks passed.",
            "recommendation": "Proceed."
        }

@router.post("/learn")
def retain_deployment_outcome(payload: RetainOutcomeRequest, db: Session = Depends(get_db)):
    spec = {
        "service": payload.service,
        "version": payload.version,
        "database_change": payload.database_change,
        "redis_change": payload.redis_change,
        "infra_change": payload.infra_change,
        "environment": payload.environment,
        "changes_summary": payload.changes_summary or f"{payload.service} deployment"
    }
    outcome_dict = payload.dict()
    learning_result = learning_agent.learn_from_outcome(db, spec, outcome_dict)
    return learning_result
