import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudentPortal from './pages/StudentPortal';
import CounsellorDashboard from './pages/CounsellorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login'; 

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <div className="p-10 text-center text-red-600 font-bold">Access Denied</div>;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F7F0E6] font-sans text-[#4A5D53]">
        <header className="bg-[#4A5D53] text-[#F7F0E6] p-5 shadow-lg flex justify-between items-center border-b-4 border-[#819E8E]">
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">Digital Wellbeing Support</h1>
          {localStorage.getItem('token') && (
            <button 
              onClick={() => { localStorage.clear(); window.location.href='/login'; }}
              className="text-sm bg-[#819E8E] text-white px-5 py-2 rounded-full hover:bg-[#B7C7BC] hover:text-[#4A5D53] transition-all font-bold shadow-sm"
            >
              Sign Out
            </button>
          )}
        </header>

        <main className="p-4 md:p-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentPortal /></ProtectedRoute>} />
            <Route path="/counsellor" element={<ProtectedRoute allowedRoles={['counsellor', 'admin']}><CounsellorDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}