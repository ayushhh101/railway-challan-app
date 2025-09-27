import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function PassengerLoginPage() {
  const [form, setForm] = useState({ mobileNumber: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/passenger/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      login(data.token, data.refreshToken || '', data.user);
      
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/passenger/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="w-full max-w-md">
        
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            {/* Page Title: Mobile 24-28px, Desktop 32-36px */}
            <h1 className="text-2xl lg:text-4xl font-bold text-blue-800 leading-tight mb-2">
              Passenger Login
            </h1>
            {/* Secondary Text: 14px */}
            <p className="text-sm text-gray-600 leading-normal">
              Access your railway challan dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Mobile Number Input */}
            <div>
              {/* Form Labels: 14px */}
              <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="mobileNumber">
                Mobile Number
              </label>
              {/* Form Inputs: 16px */}
              <input 
                type="text" 
                name="mobileNumber" 
                id="mobileNumber"
                placeholder="Enter your 10-digit mobile number" 
                value={form.mobileNumber}
                onChange={handleChange} 
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed" 
                maxLength={10} 
                required 
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="password">
                Password
              </label>
              <input 
                type="password" 
                name="password" 
                id="password"
                placeholder="Enter your password" 
                value={form.password}
                onChange={handleChange} 
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed" 
                required 
              />
            </div>

            {/* Submit Button */}
            {/* Buttons/CTAs: 16px */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login to Dashboard</span>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            {/* Secondary Text: 14px */}
            <p className="text-sm text-gray-600 leading-normal">
              Need help accessing your account?{' '}
              <Link to="/contact" className="text-blue-600 hover:text-blue-800 underline font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 leading-normal">
            This portal is for registered passengers only
          </p>
        </div>
      </div>
    </div>
  );
}
