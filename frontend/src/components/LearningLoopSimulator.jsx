import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, Brain, ArrowUpRight, Sparkles } from 'lucide-react';

export default function LearningLoopSimulator({ activeDeployment, onLearnOutcome }) {
  const [outcome, setOutcome] = useState("SUCCESS");
  const [rootCause, setRootCause] = useState("");
  const [resolution, setResolution] = useState("");
  const [lessons, setLessons] = useState("");
  const [learningResult, setLearningResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!activeDeployment) return null;

  const spec = activeDeployment.analyzed_spec || activeDeployment;

  const handleRetainSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      service: spec.service || "payment-api",
      version: spec.version || "v2.4.1",
      status: outcome,
      root_cause: rootCause || undefined,
      resolution: resolution || undefined,
      lessons: lessons || undefined,
      database_change: Boolean(spec.database_change),
      redis_change: Boolean(spec.redis_change),
      infra_change: Boolean(spec.infra_change),
      environment: spec.environment || "production",
      changes_summary: spec.changes_summary || "Deployment execution"
    };

    const res = await onLearnOutcome(payload);
    setLearningResult(res);
    setSubmitting(false);
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Agent 4: Self-Learning Feedback Loop</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">Hindsight RETAIN</span>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Record post-deployment outcome. DeployMind retains the experience so future deployments automatically avoid this failure pattern.
      </p>

      <form onSubmit={handleRetainSubmit} className="space-y-3 text-xs">
        
        {/* Outcome Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOutcome("SUCCESS")}
            className={`p-3 rounded-lg border font-bold flex items-center justify-center gap-2 transition ${
              outcome === "SUCCESS"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-900/30"
                : "bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Deployment Succeeded
          </button>

          <button
            type="button"
            onClick={() => setOutcome("FAILED")}
            className={`p-3 rounded-lg border font-bold flex items-center justify-center gap-2 transition ${
              outcome === "FAILED"
                ? "bg-red-500/20 text-red-300 border-red-500/50 shadow-lg shadow-red-900/30"
                : "bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700"
            }`}
          >
            <XCircle className="w-4 h-4 text-red-400" />
            Deployment Failed
          </button>
        </div>

        {/* Failure Details Input */}
        {outcome === "FAILED" && (
          <div className="space-y-3 p-3 bg-red-950/20 border border-red-900/30 rounded-lg animate-fadeIn">
            <div>
              <label className="text-gray-300 mb-1 block font-semibold">Root Cause</label>
              <input
                type="text"
                placeholder="e.g. Migration lock held > 45s under peak load"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-gray-300 mb-1 block font-semibold">Effective Resolution</label>
              <input
                type="text"
                placeholder="e.g. Rollback migration + restart payment pods"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-gray-300 mb-1 block font-semibold">Hindsight Lesson Learned</label>
          <input
            type="text"
            placeholder={outcome === "SUCCESS" ? "e.g. Staging dry-run successfully prevented connection locks." : "e.g. Mandate non-blocking zero-downtime migration scripts."}
            value={lessons}
            onChange={(e) => setLessons(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          RETAIN EXPERIENCE IN HINDSIGHT MEMORY
        </button>
      </form>

      {/* Instant Learning Output */}
      {learningResult && (
        <div className="mt-4 p-3 bg-purple-950/30 border border-purple-500/40 rounded-lg text-xs text-purple-200 animate-fadeIn flex items-start gap-2.5">
          <Brain className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <div className="font-bold text-white">{learningResult.message}</div>
            <div className="text-purple-300 mt-0.5">Lesson Retained: "{learningResult.lessons_learned}"</div>
          </div>
        </div>
      )}
    </div>
  );
}
