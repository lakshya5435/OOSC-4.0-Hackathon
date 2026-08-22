import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student' // default role
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const response = await apiClient.post(endpoint, formData);

      if (isRegistering) {
        // Auto-switch to login or auto-login upon successful registration
        setIsRegistering(false);
        setError('Account created successfully! Please sign in.');
      } else {
        // Save auth data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role || 'student');
        
        // Navigate to appropriate dashboard
        if (response.data.role === 'admin' || response.data.role === 'counselor') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        (isRegistering ? 'Registration failed. Try a different username.' : 'Invalid credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F0E6] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-xl border-t-8 border-[#819E8E]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#4A5D53]">
            {isRegistering ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="text-[#819E8E] text-sm mt-2">
            {isRegistering 
              ? 'Join to access secure wellbeing check-ins' 
              : 'Sign in to access your dashboard'}
          </p>
        </div>

        {/* Status / Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm font-medium text-center bg-[#FFF0F0] text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4A5D53] uppercase mb-1">
              Username / ID
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-[#B7C7BC] bg-white text-[#4A5D53] focus:ring-2 focus:ring-[#819E8E] focus:outline-none"
              placeholder="e.g., student123"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4A5D53] uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-[#B7C7BC] bg-white text-[#4A5D53] focus:ring-2 focus:ring-[#819E8E] focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-bold text-[#4A5D53] uppercase mb-1">
                Account Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-[#B7C7BC] bg-white text-[#4A5D53] focus:ring-2 focus:ring-[#819E8E] focus:outline-none"
              >
                <option value="student">Student / Individual</option>
                <option value="counselor">Counselor / Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#4A5D53] text-[#F7F0E6] py-3.5 rounded-xl font-bold hover:bg-[#819E8E] transition-colors disabled:bg-[#B7C7BC]"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        {/* Toggle Switch */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#819E8E]">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-[#4A5D53] font-bold underline hover:text-[#819E8E]"
            >
              {isRegistering ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}