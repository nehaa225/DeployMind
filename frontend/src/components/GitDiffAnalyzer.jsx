import React, { useState } from 'react';
import { Code, FileCode, AlertTriangle, ShieldCheck, Play, Sparkles, CheckCircle2 } from 'lucide-react';

const SAMPLE_SQL_DIFF = `--- a/migrations/20260928_add_payment_lock.sql
+++ b/migrations/20260928_add_payment_lock.sql
@@ -1,4 +1,7 @@
 -- Migration: Add idempotency lock table
+ALTER TABLE payment_intents ADD COLUMN lock_id INT NOT NULL;
+CREATE INDEX idx_payment_lock ON payment_intents(lock_id);
+UPDATE payment_intents SET lock_id = 0;
`;

export default function GitDiffAnalyzer({ onAnalyze }) {
  const [diffText, setDiffText] = useState(SAMPLE_SQL_DIFF);
  const [serviceName, setServiceName] = useState("payment-api");
  const [env, setEnv] = useState("production");

  const handleInspect = (e) => {
    e.preventDefault();
    
    // Auto-detect DB/Redis/Infra flags from raw diff text
    const hasDb = /ALTER\s+TABLE|CREATE\s+INDEX/i.test(diffText);
    const hasRedis = /redis|cache|ttl/i.test(diffText);
    const hasInfra = /kind:\s*(Deployment|Service)|Dockerfile/i.test(diffText);

    onAnalyze({
      service: serviceName,
      version: "v2.4.1",
      commit_sha: "a82f91",
      files_changed: 1,
      database_change: hasDb,
      redis_change: hasRedis,
      infra_change: hasInfra,
      environment: env,
      changes_summary: diffText.substring(0, 150) + "..."
    });
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">Live Git Diff & SQL Migration Inspector</h2>
        </div>
        <span className="text-xs text-gray-400 font-mono">Static Hazard Parser + Hindsight Recall</span>
      </div>

      <form onSubmit={handleInspect} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-400 mb-1 block">Target Service</label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 mb-1 block">Target Environment</label>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-gray-400 mb-1 block font-semibold">Paste Git Diff or SQL Migration Script</label>
          <textarea
            rows={8}
            value={diffText}
            onChange={(e) => setDiffText(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-gray-200 font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
            placeholder="Paste git diff output or migration file content here..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4" />
          PARSE DIFF & EVALUATE HINDSIGHT RISK
        </button>
      </form>
    </div>
  );
}
