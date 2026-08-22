import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      navigate(`/${response.data.role}`);
    } catch (err) {
      setError('Invalid credentials or server offline.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md text-center border-t-8 border-[#E4C7B0]">
        <h2 className="text-3xl font-extrabold mb-8 text-[#4A5D53]">Welcome Back</h2>
        
        {error && <div className="bg-[#E9D3C8] text-[#4A5D53] p-3 mb-6 rounded-xl font-bold text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input 
            type="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-4 bg-[#F7F0E6] border-2 border-[#B7C7BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#819E8E] text-[#4A5D53] placeholder-[#819E8E] font-medium"
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-4 bg-[#F7F0E6] border-2 border-[#B7C7BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#819E8E] text-[#4A5D53] placeholder-[#819E8E] font-medium"
            required 
          />
          <button type="submit" className="w-full bg-[#819E8E] text-white p-4 rounded-xl hover:bg-[#4A5D53] transition-colors font-bold text-lg shadow-md mt-2">
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}