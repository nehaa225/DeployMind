import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertCircle, CheckCircle, ArrowRight, Play, Wrench } from 'lucide-react';

export default function RiskAnalysisWidget({ riskAssessment, onRunValidation }) {
  const [valLoading, setValLoading] = useState(false);
  const [valResult, setValResult] = useState(null);

  if (!riskAssessment) return null;

  const riskLevel = riskAssessment.risk_level || "MEDIUM";
  const confidencePct = Math.round((riskAssessment.confidence || 0.8) * 100);
  const reasons = riskAssessment.reasons || [];
  const recommendations = riskAssessment.recommendations || [];

  const getRiskStyle = () => {
    switch (riskLevel) {
      case 'HIGH':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/40',
          text: 'text-red-400',
          badge: 'bg-red-500 text-white shadow-lg shadow-red-500/30',
          icon: ShieldAlert
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          badge: 'bg-amber-500 text-black shadow-lg shadow-amber-500/30',
          icon: AlertCircle
        };
      default:
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30',
          icon: ShieldCheck
        };
    }
  };

  const style = getRiskStyle();
  const IconComponent = style.icon;

  const handleTestRun = async (valType) => {
    setValLoading(true);
    const res = await onRunValidation(valType);
    setValResult(res);
    setValLoading(false);
  };

  return (
    <div className={`bg-[#111827] border rounded-xl p-5 shadow-xl ${style.border}`}>
      
      {/* Risk Badge Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconComponent className={`w-6 h-6 ${style.text}`} />
          <h2 className="text-base font-bold text-white">Agent 3: Risk Assessment</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block font-mono">Calculated Confidence</span>
            <span className="text-xs font-bold text-gray-200 font-mono">{confidencePct}%</span>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-extrabold tracking-wide uppercase ${style.badge}`}>
            {riskLevel} RISK
          </span>
        </div>
      </div>

      {/* Summary Line */}
      {riskAssessment.summary && (
        <p className="text-xs text-gray-300 font-medium mb-4 bg-gray-900/60 p-3 rounded-lg border border-gray-800">
          {riskAssessment.summary}
        </p>
      )}

      {/* Why? Risk Factors */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          Identified Risk Factors:
        </h4>
        <ul className="space-y-1.5 text-xs">
          {reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-300 bg-gray-900/40 p-2 rounded border border-gray-800/60">
              <span className="text-amber-400 font-bold">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actionable Preventive Recommendations */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-blue-400" />
          Recommended Preventive Engineering Checks:
        </h4>
        <div className="space-y-2">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-2.5 bg-blue-950/20 border border-blue-900/40 rounded-lg text-xs text-blue-200 flex items-start gap-2">
              <span className="font-mono font-bold text-blue-400">{idx + 1}.</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Preventive Check Runner */}
      <div className="pt-3 border-t border-gray-800">
        <div className="text-xs font-semibold text-gray-400 mb-2">Execute Recommended Preventive Validation:</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTestRun("db_migration_test")}
            disabled={valLoading}
            className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Play className="w-3 h-3" />
            Validate DB Migration Lock
          </button>
          
          <button
            onClick={() => handleTestRun("redis_compat_test")}
            disabled={valLoading}
            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Play className="w-3 h-3" />
            Test Redis Compatibility
          </button>

          <button
            onClick={() => handleTestRun("staging_deploy")}
            disabled={valLoading}
            className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Play className="w-3 h-3" />
            Deploy to Staging First
          </button>
        </div>

        {/* Validation Result Box */}
        {valResult && (
          <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">{valResult.validation}: PASSED</div>
              <div className="text-emerald-200 mt-0.5">{valResult.details}</div>
              <div className="text-gray-400 text-[11px] mt-1 font-mono">→ {valResult.recommendation}</div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
