import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import ActiveDeploymentPanel from './components/ActiveDeploymentPanel';
import MemoryInsightCard from './components/MemoryInsightCard';
import RiskAnalysisWidget from './components/RiskAnalysisWidget';
import LearningLoopSimulator from './components/LearningLoopSimulator';
import GitDiffAnalyzer from './components/GitDiffAnalyzer';
import HindsightMemoryExplorer from './components/HindsightMemoryExplorer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CIIntegrationGuide from './components/CIIntegrationGuide';
import { Brain, Database, BarChart2, FileCode, Terminal, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('deploy');
  const [loading, setLoading] = useState(false);
  const [activeDeployment, setActiveDeployment] = useState(null);
  const [memoryResult, setMemoryResult] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [memories, setMemories] = useState([]);
  const [memoryStats, setMemoryStats] = useState(null);

  // Load memories and stats on mount
  useEffect(() => {
    fetchMemoryData();
  }, []);

  const fetchMemoryData = async () => {
    try {
      const [memRes, statsRes] = await Promise.all([
        axios.get('/api/memory/'),
        axios.get('/api/memory/stats')
      ]);
      setMemories(memRes.data);
      setMemoryStats(statsRes.data);
    } catch (e) {
      console.error("Error fetching memory data:", e);
    }
  };

  const handleAnalyzeDeployment = async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/deployments/analyze', formData);
      setActiveDeployment(res.data);
      setMemoryResult(res.data.memory_recalled);
      setRiskAssessment(res.data.risk_assessment);
      await fetchMemoryData();
    } catch (e) {
      console.error("Error analyzing deployment:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunValidation = async (valType) => {
    try {
      const res = await axios.post('/api/deployments/validate', {
        validation_type: valType
      });
      return res.data;
    } catch (e) {
      console.error(e);
      return { validation: "Error", passed: false, details: "Validation failed." };
    }
  };

  const handleLearnOutcome = async (payload) => {
    try {
      const res = await axios.post('/api/deployments/learn', payload);
      await fetchMemoryData();
      return res.data;
    } catch (e) {
      console.error(e);
      return { learning_complete: false, message: "Error retaining outcome." };
    }
  };

  const handleSeedMemory = async () => {
    setLoading(true);
    try {
      await axios.post('/api/memory/seed');
      await fetchMemoryData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearMemory = async () => {
    try {
      await axios.delete('/api/memory/clear');
      setActiveDeployment(null);
      setMemoryResult(null);
      setRiskAssessment(null);
      await fetchMemoryData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        memoryStats={memoryStats}
        onOpenCI={() => setActiveTab('ci')}
        onSeedMemory={handleSeedMemory}
        onClearMemory={handleClearMemory}
        loading={loading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-gray-800 gap-2 pb-1">
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'deploy'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Brain className="w-4 h-4" />
            Active Deployment & Risk Recall
          </button>

          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'diff'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Git Diff & SQL Migration Inspector
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'memory'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Database className="w-4 h-4" />
            Hindsight Memory Store ({memories.length})
          </button>

          <button
            onClick={() => setActiveTab('ci')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'ci'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            CI/CD Pipeline Integration & CLI
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'analytics'
                ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Agent Learning Analytics
          </button>
        </div>

        {/* Tab 1: Active Deployment & Risk Recall */}
        {activeTab === 'deploy' && (
          <div className="space-y-6">
            
            {/* Top Grid: Input & Hero Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <ActiveDeploymentPanel
                  onAnalyze={handleAnalyzeDeployment}
                  loading={loading}
                />
              </div>

              <div className="lg:col-span-7">
                <MemoryInsightCard
                  memoryResult={memoryResult}
                />
              </div>
            </div>

            {/* Bottom Grid: Risk Assessment & Learning Loop Simulator */}
            {riskAssessment && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                <div className="lg:col-span-7">
                  <RiskAnalysisWidget
                    riskAssessment={riskAssessment}
                    onRunValidation={handleRunValidation}
                  />
                </div>

                <div className="lg:col-span-5">
                  <LearningLoopSimulator
                    activeDeployment={activeDeployment}
                    onLearnOutcome={handleLearnOutcome}
                  />
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Git Diff & SQL Migration Inspector */}
        {activeTab === 'diff' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <GitDiffAnalyzer
                onAnalyze={(spec) => {
                  handleAnalyzeDeployment(spec);
                  setActiveTab('deploy');
                }}
              />
            </div>
            <div className="lg:col-span-6">
              <MemoryInsightCard
                memoryResult={memoryResult}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Hindsight Memory Store */}
        {activeTab === 'memory' && (
          <HindsightMemoryExplorer
            memories={memories}
            onRefresh={fetchMemoryData}
          />
        )}

        {/* Tab 4: CI/CD Pipeline Integration & CLI */}
        {activeTab === 'ci' && (
          <CIIntegrationGuide />
        )}

        {/* Tab 5: Agent Learning Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            memoryStats={memoryStats}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-500 bg-[#0E1322]">
        DeployMind Self-Learning DevOps Pipeline Agent • Hindsight Organizational Memory Layer
      </footer>

    </div>
  );
}
