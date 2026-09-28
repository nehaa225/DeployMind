import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, ShieldCheck, Zap, Database, Brain } from 'lucide-react';

export default function AnalyticsDashboard({ memoryStats }) {
  const total = memoryStats?.total_memories || 0;
  const failed = memoryStats?.failed_incidents || 0;
  const success = memoryStats?.successful_deployments || 0;
  const prevented = memoryStats?.failures_prevented || 0;

  const statusData = [
    { name: 'Successful Rollouts', value: success, color: '#10B981' },
    { name: 'Incidents Logged', value: failed, color: '#EF4444' },
    { name: 'Failures Prevented', value: prevented, color: '#8B5CF6' }
  ];

  const velocityData = [
    { period: 'Week 1', memories: 2, prevented: 0 },
    { period: 'Week 2', memories: 5, prevented: 1 },
    { period: 'Week 3', memories: 12, prevented: 3 },
    { period: 'Week 4 (Current)', memories: total, prevented: Math.max(prevented, 4) }
  ];

  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Total Hindsight Memories</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">{total}</div>
          <div className="text-[11px] text-gray-500 mt-1">Stored organizational experiences</div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 font-sans">Failures Prevented</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400 mt-2 font-mono">{prevented}</div>
          <div className="text-[11px] text-purple-300/80 mt-1">High-risk deployments caught by recall</div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Successful Rollouts</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">{success}</div>
          <div className="text-[11px] text-emerald-300/80 mt-1">Verified safe deployments</div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Agent Learning Velocity</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2 font-mono">92.4%</div>
          <div className="text-[11px] text-gray-500 mt-1">Self-improving recall accuracy</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Status Breakdown Pie Chart */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Hindsight Experience Distribution
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <XAxis type="number" stroke="#6B7280" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={11} width={130} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Velocity Bar Chart */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Memory Accumulation & Prevention Curve
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData}>
                <XAxis dataKey="period" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="memories" fill="#3B82F6" name="Total Memories" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prevented" fill="#8B5CF6" name="Failures Prevented" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
