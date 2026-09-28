import React, { useState } from 'react';
import { GitCommit, Layers, Database, HardDrive, Server, Shield, Sparkles } from 'lucide-react';

const PRESETS = [
  {
    label: "Payment API v2.4.1 (DB + Redis Change)",
    data: {
      service: "payment-api",
      version: "v2.4.1",
      commit_sha: "a82f91",
      files_changed: 17,
      database_change: true,
      redis_change: true,
      infra_change: false,
      environment: "production",
      changes_summary: "Database schema migration + Payment API refactor + Redis configuration update"
    }
  },
  {
    label: "Auth Service v1.8.2 (JWT Key Rotation)",
    data: {
      service: "auth-service",
      version: "v1.8.2",
      commit_sha: "77f3e1",
      files_changed: 5,
      database_change: false,
      redis_change: true,
      infra_change: false,
      environment: "production",
      changes_summary: "Rotated JWT signing key secret + updated Redis auth token blacklist store"
    }
  },
  {
    label: "Order Service v3.1.0 (gRPC Microservice Split)",
    data: {
      service: "order-service",
      version: "v3.1.0",
      commit_sha: "ee8291",
      files_changed: 28,
      database_change: true,
      redis_change: false,
      infra_change: true,
      environment: "production",
      changes_summary: "Split checkout workflow into order-service and fulfillment-service gRPC calls"
    }
  }
];

export default function ActiveDeploymentPanel({ onAnalyze, loading }) {
  const [formData, setFormData] = useState(PRESETS[0].data);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSelectPreset = (preset) => {
    setFormData(preset.data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(formData);
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
      
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">Active Deployment Input</h2>
        </div>
        <span className="text-xs text-gray-400">Agent 1: Deployment Analyzer</span>
      </div>

      {/* Preset Scenario Buttons */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-400 mb-2 block">Quick Scenarios:</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
                formData.service === p.data.service && formData.version === p.data.version
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Service & Version */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-400 mb-1 block">Service Name</label>
            <input
              type="text"
              value={formData.service}
              onChange={(e) => handleChange("service", e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 mb-1 block">Version Tag</label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => handleChange("version", e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Changes Summary / Commit Msg */}
        <div>
          <label className="text-gray-400 mb-1 block">Commit Description / Changes Summary</label>
          <textarea
            rows={2}
            value={formData.changes_summary}
            onChange={(e) => handleChange("changes_summary", e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-200 text-xs focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Behavioral Change Flags */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
            formData.database_change ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-gray-900/40 border-gray-800 text-gray-400'
          }`}>
            <input
              type="checkbox"
              checked={formData.database_change}
              onChange={(e) => handleChange("database_change", e.target.checked)}
              className="hidden"
            />
            <Database className="w-4 h-4" />
            <span className="font-semibold text-xs">DB Change</span>
          </label>

          <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
            formData.redis_change ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-gray-900/40 border-gray-800 text-gray-400'
          }`}>
            <input
              type="checkbox"
              checked={formData.redis_change}
              onChange={(e) => handleChange("redis_change", e.target.checked)}
              className="hidden"
            />
            <HardDrive className="w-4 h-4" />
            <span className="font-semibold text-xs">Redis Change</span>
          </label>

          <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
            formData.infra_change ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-gray-900/40 border-gray-800 text-gray-400'
          }`}>
            <input
              type="checkbox"
              checked={formData.infra_change}
              onChange={(e) => handleChange("infra_change", e.target.checked)}
              className="hidden"
            />
            <Server className="w-4 h-4" />
            <span className="font-semibold text-xs">Infra Change</span>
          </label>
        </div>

        {/* Environment & Commit Sha */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-400 mb-1 block">Target Environment</label>
            <select
              value={formData.environment}
              onChange={(e) => handleChange("environment", e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 mb-1 block">Files Changed Count</label>
            <input
              type="number"
              value={formData.files_changed}
              onChange={(e) => handleChange("files_changed", parseInt(e.target.value) || 1)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Analyze Trigger Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          ANALYZE DEPLOYMENT RISK (AGENT RECALL)
        </button>
      </form>
    </div>
  );
}
