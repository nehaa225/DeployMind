import re
from typing import Dict, Any, List

class GitDiffAnalyzer:
    """
    Analyzes raw Git diffs, SQL migration files, Redis configs, and K8s manifests
    for stateful hazards, locking operations, and breaking changes.
    """
    def parse_diff(self, raw_diff: str) -> Dict[str, Any]:
        has_db_change = False
        has_redis_change = False
        has_infra_change = False
        detected_hazards = []

        # 1. Inspect for Database Migration locks
        if re.search(r'ALTER\s+TABLE', raw_diff, re.IGNORECASE):
            has_db_change = True
            if not re.search(r'CONCURRENTLY|ONLINE', raw_diff, re.IGNORECASE):
                detected_hazards.append({
                    "severity": "HIGH",
                    "category": "DATABASE_LOCK",
                    "file": "migration.sql",
                    "details": "ALTER TABLE detected without CONCURRENTLY/ONLINE flag. May lock primary table under traffic."
                })

        if re.search(r'CREATE\s+INDEX', raw_diff, re.IGNORECASE):
            has_db_change = True
            if not re.search(r'CONCURRENTLY', raw_diff, re.IGNORECASE):
                detected_hazards.append({
                    "severity": "HIGH",
                    "category": "DATABASE_LOCK",
                    "file": "migration.sql",
                    "details": "CREATE INDEX detected without CONCURRENTLY flag on Postgres database."
                })

        # 2. Inspect for Redis configuration changes
        if re.search(r'redis|cache|ttl|redis-cluster', raw_diff, re.IGNORECASE):
            has_redis_change = True
            if re.search(r'tls|ssl|auth|version', raw_diff, re.IGNORECASE):
                detected_hazards.append({
                    "severity": "MEDIUM",
                    "category": "CACHE_CONFIG_MISMATCH",
                    "file": "redis.conf / client_config",
                    "details": "Redis TLS/Authentication or version protocol parameters modified."
                })

        # 3. Inspect for Infrastructure / K8s changes
        if re.search(r'kind:\s*(Deployment|Service|Ingress)|Dockerfile|docker-compose', raw_diff, re.IGNORECASE):
            has_infra_change = True
            if re.search(r'port|ingress|targetPort|nodePort', raw_diff, re.IGNORECASE):
                detected_hazards.append({
                    "severity": "MEDIUM",
                    "category": "INFRA_PORT_CHANGE",
                    "file": "k8s / docker manifest",
                    "details": "Port routing or ingress topology modified."
                })

        return {
            "has_database_change": has_db_change,
            "has_redis_change": has_redis_change,
            "has_infra_change": has_infra_change,
            "detected_hazards": detected_hazards,
            "hazard_count": len(detected_hazards)
        }

git_diff_analyzer = GitDiffAnalyzer()
