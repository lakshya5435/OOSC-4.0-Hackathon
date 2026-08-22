import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

export default function CounsellorDashboard() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
  const [selectedCase, setSelectedCase] = useState(null); 
  const [actionTaken, setActionTaken] = useState(false); 

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await apiClient.get('/assessments/queue');
        setQueue(response.data);
      } catch (error) {
        console.error("Failed to load triage queue", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'Critical_Crisis': return 'bg-red-100 text-red-800 border border-red-300 animate-pulse font-extrabold';
      case 'Severe': return 'bg-orange-100 text-orange-800 border border-orange-300 font-bold';
      case 'Moderately Severe': return 'bg-[#E4C7B0] text-[#4A5D53] border border-[#E9D3C8] font-bold';
      case 'Moderate': return 'bg-[#B7C7BC] text-[#4A5D53] border border-[#819E8E] font-bold';
      default: return 'bg-[#F7F0E6] text-[#4A5D53] border border-[#B7C7BC] font-medium';
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  
  const openCaseFile = (caseItem) => {
    setSelectedCase(caseItem);
    setActionTaken(false);
  };

  if (loading) return <div className="p-20 text-center text-[#819E8E] font-bold text-xl">Loading secure triage queue...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 bg-white shadow-2xl rounded-[2rem] mt-6 border-t-8 border-[#819E8E]">
      
      {/* Dashboard Header */}
      <div className="mb-8 border-b-2 border-[#E9D3C8] pb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold mb-2 text-[#4A5D53]">Active Triage Queue</h2>
          <p className="text-[#819E8E] font-medium">Prioritized clinical caseload requiring review.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#F7F0E6] text-[#4A5D53] px-4 py-2 rounded-xl font-bold border border-[#B7C7BC] flex items-center">
            Total Cases: {queue.length}
          </div>
          <button 
            onClick={handleLogout}
            className="bg-[#4A5D53] text-[#F7F0E6] px-6 py-2 rounded-xl font-bold hover:bg-[#819E8E] transition-colors shadow-md"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E9D3C8] shadow-sm relative">
        <table className="min-w-full bg-white text-left border-collapse">
          <thead className="bg-[#4A5D53] text-[#F7F0E6]">
            <tr>
              <th className="py-4 px-6 font-bold tracking-wide">Date Submitted</th>
              <th className="py-4 px-6 font-bold tracking-wide">Anonymized ID</th>
              <th className="py-4 px-6 font-bold tracking-wide">Score</th>
              <th className="py-4 px-6 font-bold tracking-wide">Risk Level</th>
              <th className="py-4 px-6 font-bold tracking-wide">Status</th>
              <th className="py-4 px-6 font-bold tracking-wide text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-[#4A5D53]">
            {queue.map((caseItem, index) => (
              <tr key={caseItem.id} className={`border-b border-[#E9D3C8] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F7F0E6]'} hover:bg-[#E9D3C8]`}>
                <td className="py-4 px-6 font-medium">{new Date(caseItem.created_at).toLocaleDateString()}</td>
                <td className="py-4 px-6 font-mono text-sm opacity-80">{caseItem.id.split('-')[0]}***</td>
                <td className="py-4 px-6 font-black text-lg">{caseItem.total_score}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1.5 rounded-lg text-xs shadow-sm ${getRiskColor(caseItem.risk_level)}`}>
                    {caseItem.risk_level.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6 capitalize font-medium">{caseItem.status.replace('_', ' ')}</td>
                <td className="py-4 px-6 text-center">
                  <button 
                    onClick={() => openCaseFile(caseItem)}
                    className="bg-[#819E8E] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#4A5D53] transition-colors shadow-md"
                  >
                    Open File
                  </button>
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr><td colSpan="6" className="py-12 text-center text-[#819E8E] font-bold text-lg">No active cases in queue.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* The Interactive Clinical File Modal Popup */}
      {selectedCase && (
        <div className="fixed inset-0 bg-[#4A5D53] bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 md:p-10 rounded-[2rem] max-w-2xl w-full border-t-8 border-[#E4C7B0] shadow-2xl relative animate-fade-in-up">
            
            {/* conditional rendering: if action IS NOT taken, show the file details */}
            {!actionTaken ? (
              <>
                <h3 className="text-3xl font-extrabold text-[#4A5D53] mb-2">Clinical File Details</h3>
                <p className="text-[#819E8E] font-bold font-mono mb-6">Patient ID: {selectedCase.id}</p>
                
                <div className="bg-[#F7F0E6] p-6 rounded-2xl mb-6 border border-[#E9D3C8]">
                  <div className="flex justify-between mb-4">
                    <span className="font-bold text-[#4A5D53]">Total PHQ-9 Score:</span>
                    <span className="font-black text-xl text-[#4A5D53]">{selectedCase.total_score} / 27</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-[#4A5D53]">Calculated Risk Level:</span>
                    <span className={`px-3 py-1 rounded-lg text-sm shadow-sm ${getRiskColor(selectedCase.risk_level)}`}>
                      {selectedCase.risk_level.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-[#4A5D53] font-medium text-sm mb-8 bg-[#E9D3C8] p-4 rounded-xl border border-[#E4C7B0]">
                  <span className="font-bold">Automated Note:</span> This assessment was captured via the secure field application. Raw survey inputs are encrypted and require clinical clearance to view fully.
                </p>

                <div className="flex gap-4 justify-end mt-8">
                  <button 
                    onClick={() => setSelectedCase(null)} 
                    className="px-6 py-3 bg-[#F7F0E6] text-[#4A5D53] border-2 border-[#B7C7BC] font-bold rounded-xl hover:bg-[#E9D3C8] transition-colors"
                  >
                    Close File
                  </button>
                  <button 
                    onClick={() => setActionTaken(true)} // This triggers the success UI transition
                    className="px-6 py-3 bg-[#819E8E] text-white font-bold rounded-xl hover:bg-[#4A5D53] transition-colors shadow-md"
                  >
                    Take Action
                  </button>
                </div>
              </>
            ) : (
              
              /* conditional rendering: if action IS taken, show the success state */
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-[#B7C7BC] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <svg className="w-10 h-10 text-[#4A5D53]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-3xl font-extrabold text-[#4A5D53] mb-4">Patient Assigned</h3>
                <p className="text-lg text-[#819E8E] mb-6 font-medium">This patient has been successfully assigned to your clinical roster.</p>
                
                <div className="bg-[#F7F0E6] inline-block p-3 rounded-lg border border-[#E9D3C8] mb-8">
                  <p className="text-[#4A5D53] font-mono text-sm font-bold tracking-wide">ID: {selectedCase.id}</p>
                </div>
                
                <div>
                  <button 
                    onClick={() => setSelectedCase(null)} 
                    className="px-8 py-4 bg-[#819E8E] text-white font-bold rounded-xl hover:bg-[#4A5D53] transition-colors shadow-md w-full sm:w-auto"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
