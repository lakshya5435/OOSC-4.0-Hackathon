import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get('/assessments/queue');
        const data = response.data;
        
        const total = data.length;
        const critical = data.filter(d => d.risk_level === 'Critical_Crisis').length;
        const severe = data.filter(d => d.risk_level.includes('Severe')).length;
        const moderate = data.filter(d => d.risk_level === 'Moderate').length;
        const low = total - critical - severe - moderate;

        
        const riskData = [
          { name: 'Mild / Low', value: low, color: '#819E8E' },
          { name: 'Moderate', value: moderate, color: '#B7C7BC' },
          { name: 'Severe / Critical', value: severe + critical, color: '#E4C7B0' }
        ];

  
        const statusData = [
          { 
            name: 'Case Status', 
            'Pending Review': data.filter(d => d.status === 'pending_review').length,
            'Action Taken': data.filter(d => d.status !== 'pending_review').length
          }
        ];

        setStats({ total, criticalCases: critical, riskData, statusData });
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-20 text-center text-[#819E8E] font-bold text-xl">Compiling interactive reports...</div>;
  if (!stats) return <div className="p-20 text-center text-red-500">Failed to load data.</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 mt-6">
      <div className="mb-10 flex flex-col md:flex-row justify-between md:items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-[#4A5D53]">Institutional Overview</h2>
          <p className="text-[#819E8E] text-lg font-medium mt-2">Interactive, anonymized insights for resource planning.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="mt-4 md:mt-0 bg-[#F7F0E6] text-[#4A5D53] border-2 border-[#B7C7BC] px-6 py-2 rounded-xl font-bold hover:bg-[#E9D3C8] transition-colors"
        >
          Export PDF Report
        </button>
      </div>
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-[#B7C7BC] relative overflow-hidden transition-transform hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#F7F0E6] rounded-full opacity-50"></div>
          <h3 className="text-[#819E8E] text-sm font-black uppercase tracking-widest">Total Screenings</h3>
          <p className="text-6xl font-black text-[#4A5D53] mt-4">{stats.total}</p>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-[#E4C7B0] relative overflow-hidden transition-transform hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#E9D3C8] rounded-full opacity-50"></div>
          <h3 className="text-[#819E8E] text-sm font-black uppercase tracking-widest">Critical Escalations</h3>
          <p className="text-6xl font-black text-[#4A5D53] mt-4">{stats.criticalCases}</p>
          <p className="text-sm text-[#819E8E] mt-2 font-bold bg-[#F7F0E6] inline-block px-3 py-1 rounded-lg">Referred to Tele-MANAS</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-[#819E8E] relative overflow-hidden transition-transform hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#B7C7BC] rounded-full opacity-30"></div>
          <h3 className="text-[#819E8E] text-sm font-black uppercase tracking-widest">System Availability</h3>
          <p className="text-6xl font-black text-[#4A5D53] mt-4">99.9%</p>
          <p className="text-sm text-[#819E8E] mt-2 font-bold bg-[#F7F0E6] inline-block px-3 py-1 rounded-lg">Audit Trail Active</p>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Interactive Donut Chart */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-[#E9D3C8]">
          <h3 className="text-2xl font-extrabold mb-2 text-[#4A5D53]">Risk Distribution</h3>
          <p className="text-[#819E8E] text-sm font-medium mb-6">Hover over segments for exact clinical counts.</p>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats.riskData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                  stroke="none"
                >
                  {stats.riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', borderColor: '#E9D3C8', fontWeight: 'bold', color: '#4A5D53' }}
                  itemStyle={{ color: '#4A5D53' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Bar Chart */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-[#E9D3C8]">
          <h3 className="text-2xl font-extrabold mb-2 text-[#4A5D53]">Workflow Status</h3>
          <p className="text-[#819E8E] text-sm font-medium mb-6">Tracking counsellor response rates.</p>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.statusData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F7F0E6" vertical={false} />
                <XAxis dataKey="name" stroke="#819E8E" tick={{ fill: '#4A5D53', fontWeight: 'bold' }} />
                <YAxis allowDecimals={false} stroke="#819E8E" tick={{ fill: '#4A5D53', fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: '#F7F0E6' }}
                  contentStyle={{ borderRadius: '12px', borderColor: '#E9D3C8', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <Bar dataKey="Pending Review" fill="#E4C7B0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Action Taken" fill="#819E8E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}