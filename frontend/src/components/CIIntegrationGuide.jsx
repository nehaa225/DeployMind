import React, { useState } from 'react';
import { Terminal, Code, Cpu, Copy, Check, GitBranch, Server } from 'lucide-react';

export default function CIIntegrationGuide() {
  const [copiedTab, setCopiedTab] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(key);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const GITHUB_ACTIONS_YAML = `name: DeployMind Risk Gatekeeper

on:
  pull_request:
    branches: [ main, master ]

jobs:
  deploymind-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Run DeployMind Risk Gate
        run: |
          pip install -r backend/requirements.txt
          python -m backend.cli gate \\
            --service "\${{ github.event.repository.name }}" \\
            --version "\${{ github.sha }}" \\
            --database-change \\
            --fail-on-high-risk`;

  const CLI_COMMANDS = `# 1. Analyze deployment risk
python -m backend.cli analyze --service payment-api --version v2.4.1 --database-change --redis-change

# 2. Gate CI/CD pipeline (Exit 1 if HIGH risk)
python -m backend.cli gate --service payment-api --database-change --fail-on-high-risk

# 3. Record pipeline execution outcome
python -m backend.cli record --service payment-api --status FAILED --root-cause "Migration lock"`;

  const CURL_WEBHOOK = `curl -X POST "http://localhost:8000/api/webhooks/github" \\
  -H "Content-Type: application/json" \\
  -H "X-GitHub-Event: pull_request" \\
  -d '{
    "repository": {"name": "payment-api"},
    "pull_request": {"title": "ALTER TABLE payment_intents ADD COLUMN lock_id INT;"},
    "number": 42
  }'`;

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl space-y-6">
      
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">Production CI/CD Pipeline Integration</h2>
        </div>
        <p className="text-xs text-gray-400">
          Integrate DeployMind into your automated GitHub Actions, GitLab CI, or deployment pipelines to gate releases based on historical organizational memory.
        </p>
      </div>

      {/* GitHub Actions Tab */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-blue-400" />
            1. GitHub Actions Workflow (.github/workflows/deploymind-gate.yml)
          </span>
          <button
            onClick={() => copyToClipboard(GITHUB_ACTIONS_YAML, 'gha')}
            className="text-xs px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 flex items-center gap-1 font-mono transition"
          >
            {copiedTab === 'gha' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedTab === 'gha' ? 'Copied!' : 'Copy YAML'}
          </button>
        </div>
        <pre className="bg-gray-950 p-3.5 rounded-lg border border-gray-800 text-xs font-mono text-gray-300 overflow-x-auto">
          {GITHUB_ACTIONS_YAML}
        </pre>
      </div>

      {/* CLI Tool */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            2. DeployMind Command Line Interface (CLI)
          </span>
          <button
            onClick={() => copyToClipboard(CLI_COMMANDS, 'cli')}
            className="text-xs px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 flex items-center gap-1 font-mono transition"
          >
            {copiedTab === 'cli' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedTab === 'cli' ? 'Copied!' : 'Copy Commands'}
          </button>
        </div>
        <pre className="bg-gray-950 p-3.5 rounded-lg border border-gray-800 text-xs font-mono text-emerald-300/90 overflow-x-auto">
          {CLI_COMMANDS}
        </pre>
      </div>

      {/* Webhook REST API */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-purple-400" />
            3. GitHub Webhook / REST API Endpoint
          </span>
          <button
            onClick={() => copyToClipboard(CURL_WEBHOOK, 'curl')}
            className="text-xs px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 flex items-center gap-1 font-mono transition"
          >
            {copiedTab === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedTab === 'curl' ? 'Copied!' : 'Copy cURL'}
          </button>
        </div>
        <pre className="bg-gray-950 p-3.5 rounded-lg border border-gray-800 text-xs font-mono text-purple-300/90 overflow-x-auto">
          {CURL_WEBHOOK}
        </pre>
      </div>

    </div>
  );
}
