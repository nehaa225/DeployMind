import React, { useState } from 'react';
import { PlayCircle, ArrowRight, CheckCircle2, AlertTriangle, Brain, Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function DemoWalkthroughModal({ isOpen, onClose, onFinishDemo }) {
  const [currentScene, setCurrentScene] = useState(1);
  const [sceneLoading, setSceneLoading] = useState(false);
  const [sceneData, setSceneData] = useState(null);

  if (!isOpen) return null;

  const runScene = async (sceneNum) => {
    setSceneLoading(true);
    setCurrentScene(sceneNum);
    try {
      const res = await axios.post(`/api/demo/scene/${sceneNum}`);
      setSceneData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setSceneLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-purple-500/40 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30">
              <PlayCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">DeployMind 3-Scene Demo Story</h2>
              <p className="text-xs text-gray-400">Interactive walkthrough demonstrating the self-learning memory loop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm font-mono px-2 py-1 bg-gray-900 rounded border border-gray-800"
          >
            ESC
          </button>
        </div>

        {/* Scene Stepper Navigation */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { num: 1, title: "1. Empty Memory", desc: "Cold Start Test" },
            { num: 2, title: "2. Build Memory", desc: "Inject Incidents" },
            { num: 3, title: "3. Magic Moment", desc: "Recall & Prevent" }
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => runScene(s.num)}
              className={`p-3 rounded-xl border text-left transition ${
                currentScene === s.num
                  ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-900/30"
                  : "bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
            >
              <div className="text-xs font-bold font-mono">{s.title}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>

        {/* Scene Execution Output */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-5 min-h-[260px] flex flex-col justify-between">
          {sceneLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-gray-400">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-3" />
              Executing Scene {currentScene} simulation...
            </div>
          ) : !sceneData ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-gray-400">
              <Brain className="w-10 h-10 text-purple-400 mb-3" />
              Click <strong>"Execute Scene 1"</strong> below to begin the demo storyline!
            </div>
          ) : (
            <div className="space-y-3 text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-purple-300 font-sans">{sceneData.title}</span>
                <span className="bg-purple-950 text-purple-400 text-[10px] px-2 py-0.5 rounded font-mono border border-purple-800">
                  Scene {sceneData.scene} / 3
                </span>
              </div>

              <p className="text-gray-300 bg-gray-950 p-3 rounded-lg border border-gray-800">
                {sceneData.description}
              </p>

              {/* Scene 1 Output */}
              {sceneData.scene === 1 && (
                <div className="p-3 bg-gray-950 border border-gray-800 rounded-lg space-y-1.5">
                  <div className="text-gray-400">🧠 Recalled Memories: <strong>0</strong></div>
                  <div className="text-gray-300 font-medium">📢 Headline: {sceneData.memory_recalled?.hero_headline}</div>
                  <div className="text-amber-400 font-mono">⚠️ Assessment: Generic risk output (No historical memory)</div>
                </div>
              )}

              {/* Scene 2 Output */}
              {sceneData.scene === 2 && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg space-y-1 text-emerald-300">
                  <div className="font-bold text-white mb-1">✅ Successfully Retained 2 Incidents in Hindsight:</div>
                  <div>• <strong>DEP-017</strong> (Database Migration Lock - Rollback resolution)</div>
                  <div>• <strong>DEP-031</strong> (Redis Cluster Config Mismatch)</div>
                  <div className="text-gray-400 text-[11px] mt-2">Hindsight Store Total Memories: {sceneData.total_memories}</div>
                </div>
              )}

              {/* Scene 3 Output */}
              {sceneData.scene === 3 && (
                <div className="p-3.5 bg-red-950/20 border border-red-500/40 rounded-lg space-y-2">
                  <div className="text-sm font-extrabold text-red-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-bounce" />
                    {sceneData.memory_recalled?.hero_headline}
                  </div>

                  <div className="text-gray-300 bg-gray-900 p-2.5 rounded border border-gray-800">
                    <strong className="text-white">Historically Matched Incident:</strong> DEP-017 ({sceneData.memory_recalled?.matched_memories?.[0]?.similarity_pct}% Similarity match)
                    <div className="text-amber-300 text-[11px] mt-1">Root Cause: {sceneData.memory_recalled?.matched_memories?.[0]?.root_cause}</div>
                  </div>

                  <div className="text-emerald-300 font-semibold">
                    🛡️ Recommended Prevention: Validate DB migration lock & run Redis compatibility check prior to production deploy.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800 mt-4">
            <button
              onClick={() => runScene(currentScene)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg border border-gray-700 transition"
            >
              Re-run Scene {currentScene}
            </button>

            {currentScene < 3 ? (
              <button
                onClick={() => runScene(currentScene + 1)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition"
              >
                Next: Scene {currentScene + 1}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onFinishDemo();
                  onClose();
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition"
              >
                Finish Demo & Apply Memories
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
