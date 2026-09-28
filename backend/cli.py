import sys
import os
import argparse
import json

# Ensure UTF-8 output encoding for Windows terminal
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure parent directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.db.database import init_db, SessionLocal
from backend.agents.deployment_analyzer import deployment_analyzer_agent
from backend.agents.memory_agent import memory_agent
from backend.agents.risk_agent import risk_agent
from backend.agents.learning_agent import learning_agent
from backend.services.git_analyzer import git_diff_analyzer

def analyze_command(args):
    init_db()
    db = SessionLocal()
    try:
        raw_diff_content = ""
        if args.diff_file and os.path.exists(args.diff_file):
            with open(args.diff_file, "r", encoding="utf-8") as f:
                raw_diff_content = f.read()

        db_change = args.database_change
        redis_change = args.redis_change
        infra_change = args.infra_change

        if raw_diff_content:
            parsed = git_diff_analyzer.parse_diff(raw_diff_content)
            db_change = db_change or parsed["has_database_change"]
            redis_change = redis_change or parsed["has_redis_change"]
            infra_change = infra_change or parsed["has_infra_change"]

        spec_input = {
            "service": args.service,
            "version": args.version,
            "commit_sha": args.commit,
            "environment": args.environment,
            "database_change": db_change,
            "redis_change": redis_change,
            "infra_change": infra_change,
            "changes_summary": args.summary or f"{args.service} release"
        }

        analyzed = deployment_analyzer_agent.analyze(spec_input)
        recalled = memory_agent.recall_memories(db, analyzed)
        risk = risk_agent.evaluate_risk(analyzed, recalled)

        report = {
            "service": args.service,
            "version": args.version,
            "environment": args.environment,
            "risk_level": risk["risk_level"],
            "confidence": risk["confidence"],
            "hero_headline": recalled.get("hero_headline"),
            "recalled_memories_count": recalled.get("total_recalled", 0),
            "reasons": risk["reasons"],
            "recommendations": risk["recommendations"],
            "historical_matches": risk["historical_matches"]
        }

        if args.json:
            print(json.dumps(report, indent=2))
        else:
            print("\n=======================================================")
            print(f"  DEPLOYMIND RISK REPORT: {args.service} ({args.version})")
            print("=======================================================")
            print(f"Risk Rating : {risk['risk_level']} (Confidence: {int(risk['confidence']*100)}%)")
            print(f"Headline    : {recalled.get('hero_headline')}")
            print("\nRisk Reasons:")
            for r in risk["reasons"]:
                print(f"  • {r}")
            print("\nPreventive Recommendations:")
            for idx, rec in enumerate(risk["recommendations"], 1):
                print(f"  {idx}. {rec}")
            print("=======================================================\n")
    finally:
        db.close()

def gate_command(args):
    init_db()
    db = SessionLocal()
    try:
        spec_input = {
            "service": args.service,
            "version": args.version,
            "commit_sha": args.commit,
            "environment": args.environment,
            "database_change": args.database_change,
            "redis_change": args.redis_change,
            "infra_change": args.infra_change,
            "changes_summary": args.summary or f"{args.service} release"
        }

        analyzed = deployment_analyzer_agent.analyze(spec_input)
        recalled = memory_agent.recall_memories(db, analyzed)
        risk = risk_agent.evaluate_risk(analyzed, recalled)

        level = risk["risk_level"]
        print(f"[DeployMind CI Gate] Evaluation complete: {level} RISK")

        if level == "HIGH" and args.fail_on_high_risk:
            print("❌ DEPLOYMENT BLOCKED: High risk detected based on historical memory & stateful changes.")
            print("Run preventive checks or request manual DevOps override.")
            sys.exit(1)
        else:
            print("✅ DEPLOYMENT ALLOWED: Passed pipeline risk gate.")
            sys.exit(0)
    finally:
        db.close()

def record_command(args):
    init_db()
    db = SessionLocal()
    try:
        spec = {
            "service": args.service,
            "version": args.version,
            "database_change": args.database_change,
            "redis_change": args.redis_change,
            "environment": args.environment,
            "changes_summary": args.summary or f"{args.service} execution"
        }
        outcome = {
            "status": args.status,
            "root_cause": args.root_cause,
            "resolution": args.resolution,
            "lessons": args.lessons
        }

        res = learning_agent.learn_from_outcome(db, spec, outcome)
        print(f"✅ Retained outcome in Hindsight: {res['message']}")
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(prog="deploymind", description="DeployMind DevOps Pipeline Agent CLI")
    subparsers = parser.add_subparsers(dest="command", help="CLI commands")

    # analyze subcommand
    p_analyze = subparsers.add_parser("analyze", help="Analyze deployment risk")
    p_analyze.add_argument("--service", required=True, help="Service name")
    p_analyze.add_argument("--version", default="v1.0.0", help="Version tag")
    p_analyze.add_argument("--commit", default="head", help="Commit SHA")
    p_analyze.add_argument("--environment", default="production", help="Target env")
    p_analyze.add_argument("--database-change", action="store_true", help="DB migration flag")
    p_analyze.add_argument("--redis-change", action="store_true", help="Redis change flag")
    p_analyze.add_argument("--infra-change", action="store_true", help="Infra change flag")
    p_analyze.add_argument("--summary", help="Changes description")
    p_analyze.add_argument("--diff-file", help="Path to raw git diff file")
    p_analyze.add_argument("--json", action="store_true", help="Output JSON")

    # gate subcommand
    p_gate = subparsers.add_parser("gate", help="CI/CD pipeline risk gatekeeper")
    p_gate.add_argument("--service", required=True, help="Service name")
    p_gate.add_argument("--version", default="v1.0.0", help="Version tag")
    p_gate.add_argument("--commit", default="head", help="Commit SHA")
    p_gate.add_argument("--environment", default="production", help="Target env")
    p_gate.add_argument("--database-change", action="store_true", help="DB migration flag")
    p_gate.add_argument("--redis-change", action="store_true", help="Redis change flag")
    p_gate.add_argument("--infra-change", action="store_true", help="Infra change flag")
    p_gate.add_argument("--summary", help="Changes description")
    p_gate.add_argument("--fail-on-high-risk", action="store_true", help="Exit code 1 if HIGH risk")

    # record subcommand
    p_record = subparsers.add_parser("record", help="Record deployment execution outcome into Hindsight")
    p_record.add_argument("--service", required=True, help="Service name")
    p_record.add_argument("--version", default="v1.0.0", help="Version tag")
    p_record.add_argument("--status", choices=["SUCCESS", "FAILED"], required=True, help="Execution status")
    p_record.add_argument("--root-cause", help="Root cause if failed")
    p_record.add_argument("--resolution", help="Resolution if failed")
    p_record.add_argument("--lessons", help="Lessons learned")
    p_record.add_argument("--database-change", action="store_true")
    p_record.add_argument("--redis-change", action="store_true")
    p_record.add_argument("--environment", default="production")
    p_record.add_argument("--summary", help="Changes summary")

    args = parser.parse_args()

    if args.command == "analyze":
        analyze_command(args)
    elif args.command == "gate":
        gate_command(args)
    elif args.command == "record":
        record_command(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
