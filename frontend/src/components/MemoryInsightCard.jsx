import React from 'react';
import { Brain, AlertTriangle, CheckCircle2, History, ArrowRight, Tag, Lightbulb } from 'lucide-react';

export default function MemoryInsightCard({ memoryResult }) {
  if (!memoryResult) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[220px]">
        <Brain className="w-10 h-10 text-gray-700 mb-2 animate-bounce" />
        <h3 className="text-sm font-bold text-gray-400">Hindsight Memory Ready</h3>
        <p className="text-xs text-gray-500 max-w-sm mt-1">
          Submit a deployment specification to recall historically similar deployments, root causes, and resolutions.
        </p>
      </div>
    );
  }

  const matches = memoryResult.matched_memories || [];
  const topMatch = matches[0];
  const heroHeadline = memoryResult.hero_headline;
  const isHighSimFail = topMatch && topMatch.similarity_pct >= 75.0 && topMatch.status === "FAILED";

  return (
    <div className={`bg-[#111827] border rounded-xl p-5 shadow-xl transition-all ${
      isHighSimFail ? 'border-red-500/50 glow-high' : 'border-purple-500/30 glow-hero'
    }`}>
      
      {/* Hero Headline Box */}
      <div className={`p-3.5 rounded-lg border mb-4 flex items-start gap-3 ${
        isHighSimFail 
          ? 'bg-red-500/10 border-red-500/30 text-red-200' 
          : matches.length > 0 
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
            : 'bg-gray-800/60 border-gray-700 text-gray-300'
      }`}>
        <Brain className={`w-5 h-5 mt-0.5 shrink-0 ${isHighSimFail ? 'text-red-400 animate-pulse' : 'text-purple-400'}`} />
        <div>
          <h3 className="text-sm font-extrabold tracking-wide font-sans">
            "I'VE SEEN THIS DEPLOYMENT BEFORE"
          </h3>
          <p className="text-xs mt-1 font-medium leading-relaxed">
            {heroHeadline}
          </p>
        </div>
      </div>

      {/* Recalled Memory List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span className="font-semibold flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-blue-400" />
            Recalled Hindsight Memories ({memoryResult.total_recalled})
          </span>
          <span>Agent 2: Memory Layer</span>
        </div>

        {matches.length === 0 ? (
          <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg text-xs text-gray-400 text-center">
            No historical deployment memories matched this pattern (Cold Start).
          </div>
        ) : (
          matches.map((mem) => {
            const isFailed = mem.status === "FAILED";
            return (
              <div 
                key={mem.memory_id}
                className="bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-lg p-3.5 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                      {mem.memory_id}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{mem.service} ({mem.version})</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isFailed 
                        ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {mem.status}
                    </span>
                  </div>

                  {/* Similarity Badge */}
                  <div className="flex items-center gap-1 bg-purple-950/60 text-purple-300 px-2.5 py-1 rounded border border-purple-800/40 text-xs font-mono font-bold">
                    <span>{mem.similarity_pct}%</span>
                    <span className="text-[10px] text-purple-400 font-sans font-normal">Match</span>
                  </div>
                </div>

                {/* Changes Summary */}
                <p className="text-xs text-gray-300 font-medium mb-2">
                  {mem.changes_summary}
                </p>

                {/* Root Cause & Resolution Breakdown */}
                {isFailed && (
                  <div className="mt-2 space-y-1.5 text-xs bg-red-950/20 p-2.5 rounded border border-red-900/30">
                    {mem.symptoms && (
                      <div className="flex items-start gap-1.5 text-red-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <div><strong className="text-red-200">Symptoms:</strong> {mem.symptoms}</div>
                      </div>
                    )}
                    {mem.root_cause && (
                      <div className="flex items-start gap-1.5 text-amber-300">
                        <span className="font-bold text-amber-400">Root Cause:</span>
                        <div>{mem.root_cause}</div>
                      </div>
                    )}
                    {mem.resolution && (
                      <div className="flex items-start gap-1.5 text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div><strong className="text-emerald-200">Resolution:</strong> {mem.resolution}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Lesson Learned */}
                {mem.lessons && (
                  <div className="mt-2 text-xs text-indigo-300 flex items-start gap-1.5 bg-indigo-950/30 p-2 rounded border border-indigo-900/40">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div><strong className="text-indigo-200">Hindsight Lesson:</strong> {mem.lessons}</div>
                  </div>
                )}

                {/* Tags */}
                {mem.tags && mem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {mem.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                        <Tag className="w-2.5 h-2.5 text-gray-500" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
