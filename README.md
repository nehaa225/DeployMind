# DeployMind — Self-Learning DevOps Pipeline Agent 🚀

DeployMind is an intelligent DevOps pipeline agent built with persistent organizational memory (**Hindsight Memory Layer**). Instead of functioning as a basic CI/CD status dashboard or passive AI chatbot, DeployMind tracks past deployment experiences (build failures, schema migrations, configuration changes, root causes, and resolutions) to dynamically evaluate risk and recommend safe deployment strategies for future changes.

---

## Key Features

1. **"I've Seen This Deployment Before" Hero Memory Recall**:
   - Automatically searches past deployment records using semantic & structural similarity matching.
   - Calculates exact similarity percentages (e.g. 91% match with `DEP-017`).
   - Displays historical symptoms, root causes, effective resolutions, and lessons learned.

2. **4-Agent Architecture**:
   - **Agent 1 — Deployment Analyzer**: Parses raw commit specs, diff complexity, DB migrations, Redis configs, and infra changes.
   - **Agent 2 — Memory Agent (Hindsight Layer)**: Interfaces with Hindsight store, executes similarity scoring, and recalls top historical matches.
   - **Agent 3 — Risk Analysis Agent**: Synthesizes deployment spec + recalled memories to calculate Risk Rating (LOW / MEDIUM / HIGH), confidence score, risk factors, and actionable preventive recommendations.
   - **Agent 4 — Learning Agent (Post-Deployment Retain Loop)**: Captures execution outcomes (SUCCESS / FAILED), extracts symptoms, root cause, and resolution, and persists new learnings back to Hindsight memory.

3. **Interactive 3-Scene Demo Storytelling**:
   - **Scene 1 (Cold Start)**: 0 memories in Hindsight store -> returns standard/generic assessment.
   - **Scene 2 (Incident Retention)**: Simulates deployment failure -> retains root cause & resolution in memory.
   - **Scene 3 (The Magic Moment)**: Re-runs similar deployment -> recalls past failure (91% match), flags HIGH RISK, and recommends preventive validation.

4. **Modern Dark UI Dashboard**:
   - Active deployment input & quick scenario selector.
   - Live risk gauge & preventive check runner (Database lock test, Redis compatibility test, Staging deploy).
   - Interactive Hindsight memory store explorer with search & filters.
   - Analytics dashboard with risk distribution & prevention velocity charts.

---

## Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Run the Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```
Backend API docs available at `http://localhost:8000/docs`.

### 2. Run the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run the CLI Demo Simulation
```bash
python scripts/run_demo.py
```

---

## Testing
Run automated unit tests:
```bash
python -m pytest backend/tests/test_hindsight.py
```
