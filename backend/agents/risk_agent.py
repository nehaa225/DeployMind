from typing import Dict, Any, List
from backend.services.llm_service import llm_service

class RiskAgent:
    """
    Agent 3 — Risk Analysis Agent
    Combines current deployment parameters, extracted risk vectors, and recalled historical
    Hindsight memories to produce a structured risk assessment, confidence rating,
    risk factors breakdown, and actionable preventive recommendations.
    """
    def evaluate_risk(
        self,
        analyzed_spec: Dict[str, Any],
        memory_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        recalled_memories = memory_result.get("matched_memories", [])
        
        # Use LLM Service (or heuristic fallback)
        risk_output = llm_service.analyze_risk_with_llm(analyzed_spec, recalled_memories)

        # Enhance with specific match references
        top_failures = [m for m in recalled_memories if m.get("status") == "FAILED" and m.get("similarity_pct", 0) >= 70.0]
        
        historical_matches_summary = []
        for mem in recalled_memories[:3]:
            historical_matches_summary.append({
                "memory_id": mem["memory_id"],
                "similarity_pct": mem["similarity_pct"],
                "status": mem["status"],
                "root_cause": mem.get("root_cause") or "N/A",
                "resolution": mem.get("resolution") or "N/A"
            })

        return {
            "risk_level": risk_output.get("risk_level", "MEDIUM"),
            "confidence": risk_output.get("confidence", 0.85),
            "reasons": risk_output.get("reasons", []),
            "recommendations": risk_output.get("recommendations", []),
            "summary": risk_output.get("summary", ""),
            "historical_matches": historical_matches_summary,
            "has_critical_past_failure": len(top_failures) > 0
        }

risk_agent = RiskAgent()
