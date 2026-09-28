import React from 'react';
import { Brain, Cpu, Database, Terminal, RefreshCw, Zap, GitBranch } from 'lucide-react';

export default function Header({ memoryStats, onOpenCI, onSeedMemory, onClearMemory, loading }) {
  return (
    <header className="border-b border-gray-800 bg-[#0E1322]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-purple-600 to-indigo-500 rounded-xl shadow-lg shadow-purple-500/20">
            <Brain className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                DEPLOYMIND
              </h1>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                DevOps Control Center
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Self-Learning Pipeline Agent & Hindsight Organizational Memory Store
            </p>
          </div>
        </div>

        {/* Memory Stats Indicators */}
        <div className="flex items-center gap-3 bg-gray-900/60 p-1.5 rounded-lg border border-gray-800 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800/80">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-gray-400">Hindsight Memories:</span>
            <span className="font-bold text-white font-mono">{memoryStats?.total_memories || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800/80">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-400">Prevented:</span>
            <span className="font-bold text-emerald-400 font-mono">{memoryStats?.failures_prevented || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800/80">
            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-gray-400">Gatekeeper:</span>
            <span className="font-mono text-purple-300 font-medium">Active CLI & CI/CD</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCI}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg text-xs transition shadow-md shadow-purple-900/30"
          >
            <Terminal className="w-4 h-4" />
            CI/CD Integration Setup
          </button>
          
          <button
            onClick={onSeedMemory}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium rounded-lg border border-gray-700 transition"
            title="Seed synthetic organizational memory dataset"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
            Seed Dataset
          </button>

          <button
            onClick={onClearMemory}
            className="px-2.5 py-1.5 bg-gray-900 hover:bg-red-950/40 text-gray-400 hover:text-red-400 text-xs font-medium rounded-lg border border-gray-800 hover:border-red-900/50 transition"
            title="Clear memory store"
          >
            Clear
          </button>
        </div>

      </div>
    </header>
  );
}
