from typing import Dict, Any
from sqlalchemy.orm import Session
from backend.memory.hindsight_store import HindsightStore

class LearningAgent:
    """
    Agent 4 — Learning Agent (Post-Deployment Retain Loop)
    Analyzes execution outcome, captures root causes, resolutions, and lessons learned,
    and updates the persistent Hindsight memory store to ensure the organization
    learns from every single deployment.
    """
    def learn_from_outcome(
        self,
        db: Session,
        deployment_spec: Dict[str, Any],
        outcome_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        store = HindsightStore(db)

        status = outcome_data.get("status", "SUCCESS")
        symptoms = outcome_data.get("symptoms")
        root_cause = outcome_data.get("root_cause")
        resolution = outcome_data.get("resolution")
        lessons = outcome_data.get("lessons")

        if status == "FAILED" and not root_cause:
            # Auto synthesize failure root cause if unprovided
            db_change = deployment_spec.get("database_change", False)
            redis_change = deployment_spec.get("redis_change", False)
            if db_change and redis_change:
                symptoms = "Database connection pool lock & Redis TLS protocol timeout"
                root_cause = "Migration lock held under concurrent traffic + Redis cluster config mismatch"
                resolution = "Rollback migration script + align Redis client TLS parameters"
                lessons = "Execute staging validation dry-run for combined DB and Redis changes."
            elif db_change:
                symptoms = "Exclusive lock on primary table causing HTTP 504 timeouts"
                root_cause = "Unindexed ALTER TABLE migration lock"
                resolution = "Rollback schema change and re-apply with non-blocking index"
                lessons = "Mandate zero-downtime pg_repack validation for database migrations."

        elif status == "SUCCESS" and not lessons:
            lessons = "Deployment executed cleanly after preventive validation checks."

        memory_payload = {
            "id": outcome_data.get("id"),
            "service": deployment_spec.get("service", "unknown"),
            "version": deployment_spec.get("version", "v1.0.0"),
            "commit_sha": deployment_spec.get("commit_sha", "a1b2c3d"),
            "environment": deployment_spec.get("environment", "production"),
            "changes_summary": deployment_spec.get("changes_summary", ""),
            "database_change": bool(deployment_spec.get("database_change", False)),
            "redis_change": bool(deployment_spec.get("redis_change", False)),
            "infra_change": bool(deployment_spec.get("infra_change", False)),
            "status": status,
            "failure_type": outcome_data.get("failure_type", "INCIDENT" if status == "FAILED" else None),
            "symptoms": symptoms,
            "root_cause": root_cause,
            "resolution": resolution,
            "lessons": lessons,
            "tags": deployment_spec.get("extracted_tags", ["deployment"])
        }

        retained_result = store.retain(memory_payload)

        return {
            "learning_complete": True,
            "retained_memory_id": retained_result["id"],
            "status": retained_result["status"],
            "lessons_learned": retained_result["lessons"],
            "message": f"🧠 Hindsight RETAIN successful: Saved deployment experience as {retained_result['id']}."
        }

learning_agent = LearningAgent()
