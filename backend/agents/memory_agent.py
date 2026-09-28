from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.memory.hindsight_store import HindsightStore

class MemoryAgent:
    """
    Agent 2 — Memory Agent (Hindsight Layer)
    Recalls historically similar deployments from persistent Hindsight memory store,
    analyzes prior failures vs successes, and highlights high-similarity matches.
    """
    def recall_memories(self, db: Session, analyzed_spec: Dict[str, Any], top_k: int = 5) -> Dict[str, Any]:
        store = HindsightStore(db)
        matches = store.recall(analyzed_spec, top_k=top_k)

        failures_found = [m for m in matches if m["status"] == "FAILED"]
        successes_found = [m for m in matches if m["status"] == "SUCCESS"]
        prevented_found = [m for m in matches if m["status"] == "PREVENTED"]

        top_similarity = matches[0]["similarity_pct"] if matches else 0.0

        hero_headline = None
        if top_similarity >= 75.0:
            top_match = matches[0]
            if top_match["status"] == "FAILED":
                hero_headline = f"⚠️ I've seen this deployment before! Matches {top_match['memory_id']} ({top_match['similarity_pct']}% similarity) which FAILED previously."
            else:
                hero_headline = f"✅ I've seen this deployment pattern before! Matches {top_match['memory_id']} ({top_match['similarity_pct']}% similarity) which SUCCEEDED."
        elif matches:
            hero_headline = f"🧠 Recalled {len(matches)} historical deployment memories (Top match: {top_similarity}% similarity)."
        else:
            hero_headline = "ℹ️ No historically similar deployments found in organizational memory."

        return {
            "matched_memories": matches,
            "total_recalled": len(matches),
            "top_similarity_pct": top_similarity,
            "failed_count": len(failures_found),
            "success_count": len(successes_found),
            "prevented_count": len(prevented_found),
            "hero_headline": hero_headline
        }

memory_agent = MemoryAgent()
