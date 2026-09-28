from typing import Dict, Any

class DeploymentAnalyzerAgent:
    """
    Agent 1 — Deployment Analyzer
    Parses incoming commit/deployment payloads, extracts service blast radius,
    change complexities, stateful triggers (DB, Redis, Infra), and environment criticality.
    """
    def analyze(self, raw_input: Dict[str, Any]) -> Dict[str, Any]:
        service = raw_input.get("service", "unknown-service")
        commit_sha = raw_input.get("commit_sha") or raw_input.get("commit") or "a1b2c3d"
        files_changed = int(raw_input.get("files_changed", 1))
        database_change = bool(raw_input.get("database_change", False))
        redis_change = bool(raw_input.get("redis_change", False))
        infra_change = bool(raw_input.get("infra_change", False))
        environment = raw_input.get("environment", "production")
        commit_msg = raw_input.get("changes_summary") or raw_input.get("commit_msg") or "Updated deployment code"

        affected_components = [service]
        change_tags = []

        if database_change:
            affected_components.append("PostgreSQL / Database")
            change_tags.append("database")
            change_tags.append("migration")

        if redis_change:
            affected_components.append("Redis Cache Cluster")
            change_tags.append("redis")
            change_tags.append("cache")

        if infra_change:
            affected_components.append("Kubernetes / Infra Topology")
            change_tags.append("infra")

        change_tags.append(environment.lower())

        # Determine complexity score
        complexity_score = min(files_changed * 0.05 + (0.3 if database_change else 0) + (0.25 if redis_change else 0) + (0.2 if infra_change else 0), 1.0)

        return {
            "service": service,
            "commit_sha": commit_sha,
            "environment": environment,
            "files_changed": files_changed,
            "database_change": database_change,
            "redis_change": redis_change,
            "infra_change": infra_change,
            "changes_summary": commit_msg,
            "affected_components": affected_components,
            "complexity_score": round(complexity_score, 2),
            "extracted_tags": change_tags
        }

deployment_analyzer_agent = DeploymentAnalyzerAgent()
