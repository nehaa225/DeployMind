import React, { useState } from 'react';
import { Database, Search, Filter, AlertTriangle, CheckCircle, Tag, Lightbulb, ExternalLink } from 'lucide-react';

export default function HindsightMemoryExplorer({ memories, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMem, setSelectedMem] = useState(null);

  const filtered = (memories || []).filter(mem => {
    const matchesSearch = 
      (mem.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem.service || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem.changes_summary || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem.root_cause || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem.lessons || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || mem.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">Hindsight Memory Store</h2>
          <span className="text-xs bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full font-mono border border-purple-800/40">
            {filtered.length} entries
          </span>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search memories, tags, root causes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-64"
            />
          </div>

          <div className="flex bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-xs">
            {["ALL", "FAILED", "SUCCESS"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  statusFilter === st
                    ? "bg-purple-600 text-white shadow"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Table / Card List */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-gray-900/40 rounded-lg border border-gray-800">
            No memories match the filter criteria.
          </div>
        ) : (
          filtered.map((mem) => {
            const isFailed = mem.status === "FAILED";
            return (
              <div
                key={mem.id}
                onClick={() => setSelectedMem(mem)}
                className="bg-gray-900/70 border border-gray-800 hover:border-purple-500/50 rounded-lg p-3.5 cursor-pointer transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                      {mem.id}
                    </span>
                    <span className="text-xs font-semibold text-gray-200">{mem.service}</span>
                    <span className="text-xs text-gray-400 font-mono">({mem.version})</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isFailed 
                        ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {mem.status}
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-500 font-mono">
                    {mem.environment}
                  </span>
                </div>

                <p className="text-xs text-gray-300 line-clamp-1 mb-1.5 font-medium">
                  {mem.changes_summary}
                </p>

                {isFailed && mem.root_cause && (
                  <div className="text-[11px] text-red-300 bg-red-950/20 p-2 rounded border border-red-900/30 flex items-start gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div><strong className="text-red-200">Root Cause:</strong> {mem.root_cause}</div>
                  </div>
                )}

                {mem.lessons && (
                  <div className="text-[11px] text-indigo-300 bg-indigo-950/20 p-2 rounded border border-indigo-900/30 flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div><strong className="text-indigo-200">Lesson:</strong> {mem.lessons}</div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Memory Detail Modal */}
      {selectedMem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedMem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono font-bold text-sm text-white bg-purple-950 px-2.5 py-1 rounded border border-purple-800">
                {selectedMem.id}
              </span>
              <h3 className="text-base font-bold text-white">{selectedMem.service} ({selectedMem.version})</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block font-semibold">Changes Summary:</span>
                <p className="text-gray-200 mt-1 bg-gray-900 p-2.5 rounded border border-gray-800">{selectedMem.changes_summary}</p>
              </div>

              {selectedMem.symptoms && (
                <div>
                  <span className="text-red-400 block font-semibold">Symptoms:</span>
                  <p className="text-red-200 mt-1 bg-red-950/30 p-2.5 rounded border border-red-900/40">{selectedMem.symptoms}</p>
                </div>
              )}

              {selectedMem.root_cause && (
                <div>
                  <span className="text-amber-400 block font-semibold">Root Cause:</span>
                  <p className="text-amber-200 mt-1 bg-amber-950/30 p-2.5 rounded border border-amber-900/40">{selectedMem.root_cause}</p>
                </div>
              )}

              {selectedMem.resolution && (
                <div>
                  <span className="text-emerald-400 block font-semibold">Resolution:</span>
                  <p className="text-emerald-200 mt-1 bg-emerald-950/30 p-2.5 rounded border border-emerald-900/40">{selectedMem.resolution}</p>
                </div>
              )}

              {selectedMem.lessons && (
                <div>
                  <span className="text-indigo-400 block font-semibold">Hindsight Lesson:</span>
                  <p className="text-indigo-200 mt-1 bg-indigo-950/30 p-2.5 rounded border border-indigo-900/40">{selectedMem.lessons}</p>
                </div>
              )}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedMem(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
