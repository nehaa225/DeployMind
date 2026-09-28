from typing import Dict, Any
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from backend.db.database import get_db
from backend.agents.deployment_analyzer import deployment_analyzer_agent
from backend.agents.memory_agent import memory_agent
from backend.agents.risk_agent import risk_agent
from backend.services.git_analyzer import git_diff_analyzer

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/github")
async def github_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Receives real GitHub pull_request and deployment webhooks,
    runs DeployMind risk evaluation, and returns a formatted Markdown report.
    """
    payload = await request.json()
    event_type = request.headers.get("X-GitHub-Event", "pull_request")

    service_name = payload.get("repository", {}).get("name", "unknown-repo")
    pr_title = payload.get("pull_request", {}).get("title", "Updated deployment release")
    commit_sha = payload.get("pull_request", {}).get("head", {}).get("sha", "head")

    # Analyze PR description / title for stateful triggers
    parsed_diff = git_diff_analyzer.parse_diff(pr_title)

    spec_input = {
        "service": service_name,
        "version": f"PR-{payload.get('number', 1)}",
        "commit_sha": commit_sha,
        "environment": "production",
        "database_change": parsed_diff["has_database_change"],
        "redis_change": parsed_diff["has_redis_change"],
        "infra_change": parsed_diff["has_infra_change"],
        "changes_summary": pr_title
    }

    analyzed = deployment_analyzer_agent.analyze(spec_input)
    recalled = memory_agent.recall_memories(db, analyzed)
    risk_output = risk_agent.evaluate_risk(analyzed, recalled)

    # Generate GitHub Markdown Comment Body
    markdown_comment = f"""## 🧠 DeployMind DevOps Agent Analysis

### Risk Level: **{risk_output['risk_level']}** (Confidence: {int(risk_output['confidence']*100)}%)

> {recalled.get('hero_headline', 'Analyzed against persistent Hindsight memory store.')}

#### Identified Risk Factors:
{"".join([f"- {r}\n" for r in risk_output['reasons']])}

#### Actionable Preventive Recommendations:
{"".join([f"1. {rec}\n" for rec in risk_output['recommendations']])}

---
*Powered by DeployMind Self-Learning DevOps Agent*
"""

    return {
        "event": event_type,
        "service": service_name,
        "risk_level": risk_output['risk_level'],
        "confidence": risk_output['confidence'],
        "github_markdown_comment": markdown_comment
    }
