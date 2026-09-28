import json
import logging
from typing import Dict, Any, List
from backend.config import settings

logger = logging.getLogger("deploymind.llm")

class LLMService:
    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY
        self.openai_api_key = settings.OPENAI_API_KEY

    def is_available(self) -> bool:
        return bool(self.groq_api_key or self.openai_api_key)

    def analyze_risk_with_llm(
        self,
        deployment_spec: Dict[str, Any],
        recalled_memories: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Synthesizes deployment spec and historical memories using LLM or smart reasoning fallback.
        """
        if self.groq_api_key:
            try:
                import requests
                prompt = self._build_risk_prompt(deployment_spec, recalled_memories)
                response = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.groq_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": settings.LLM_MODEL,
                        "messages": [
                            {"role": "system", "content": "You are DeployMind Risk Analyzer Agent. Respond ONLY with valid JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "response_format": {"type": "json_object"},
                        "temperature": 0.2
                    },
                    timeout=10
                )
                if response.status_code == 200:
                    content = response.json()["choices"][0]["message"]["content"]
                    return json.loads(content)
            except Exception as e:
                logger.warning(f"Groq API call failed: {e}. Falling back to smart heuristic engine.")

        # Fallback Heuristic Reasoning Engine
        return self._heuristic_risk_analysis(deployment_spec, recalled_memories)

    def _build_risk_prompt(self, spec: Dict[str, Any], memories: List[Dict[str, Any]]) -> str:
        return f"""
Analyze this deployment proposal against historical organizational memory.

DEPLOYMENT SPECIFICATION:
{json.dumps(spec, indent=2)}

RECALLED HISTORICAL MEMORIES (Top matches):
{json.dumps(memories, indent=2)}

Produce a JSON object with exact keys:
- "risk_level": "HIGH" | "MEDIUM" | "LOW"
- "confidence": number between 0.50 and 0.98
- "reasons": list of concise strings detailing risk factors
- "recommendations": list of actionable preventive engineering checks
- "summary": string explaining the risk assessment based on past memory
"""

    def _heuristic_risk_analysis(
        self,
        spec: Dict[str, Any],
        memories: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        service = spec.get("service", "unknown")
        db_change = spec.get("database_change", False)
        redis_change = spec.get("redis_change", False)
        infra_change = spec.get("infra_change", False)
        env = spec.get("environment", "production")

        failures = [m for m in memories if m.get("status") == "FAILED"]
        high_sim_failures = [m for m in failures if m.get("similarity_pct", 0) >= 80.0]

        reasons = []
        recommendations = []
        risk_score = 0.2  # base risk

        if env == "production":
            risk_score += 0.15

        if db_change:
            risk_score += 0.25
            reasons.append("Database schema migration included in target deployment")
            recommendations.append("Validate database migration lock & zero-downtime script execution")

        if redis_change:
            risk_score += 0.20
            reasons.append("Redis configuration / data structure modified")
            recommendations.append("Run Redis protocol & key format compatibility tests")

        if infra_change:
            risk_score += 0.20
            reasons.append("Infrastructure / network topology changes detected")
            recommendations.append("Verify ingress routing rules & firewall ports")

        if high_sim_failures:
            risk_score += 0.35
            top_fail = high_sim_failures[0]
            reasons.append(f"Found {len(high_sim_failures)} historically similar failed deployment(s) (e.g. {top_fail['memory_id']} with {top_fail['similarity_pct']}% similarity)")
            if top_fail.get("root_cause"):
                reasons.append(f"Historical root cause: {top_fail['root_cause']}")
            if top_fail.get("lessons"):
                recommendations.append(f"Lesson from {top_fail['memory_id']}: {top_fail['lessons']}")
            else:
                recommendations.append("Deploy to staging environment first before production rollout")
        elif len(memories) == 0:
            reasons.append("No historically similar deployments found in organizational memory (Cold Start)")
            recommendations.append("Monitor initial canary rollout closely")

        # Determine level
        if risk_score >= 0.70 or len(high_sim_failures) > 0:
            level = "HIGH"
        elif risk_score >= 0.40:
            level = "MEDIUM"
        else:
            level = "LOW"

        confidence = round(min(0.65 + (len(memories) * 0.08), 0.95), 2)

        summary = f"DeployMind analyzed {service} for {env}. "
        if high_sim_failures:
            summary += f"⚠️ HIGH RISK flagged due to {len(high_sim_failures)} past similar failure(s) in memory."
        elif memories:
            summary += f"Recalled {len(memories)} past deployments with safe or manageable patterns."
        else:
            summary += "No prior deployment experience found."

        return {
            "risk_level": level,
            "confidence": confidence,
            "reasons": reasons,
            "recommendations": recommendations,
            "summary": summary
        }

llm_service = LLMService()
