import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SHA256 from 'crypto-js/sha256'
import toast from 'react-hot-toast';
import { handleApiError } from '../utils/errorHandler';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ employeeId: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // if offline and credentials exist, allow instant access
    if (!navigator.onLine) {
      const savedCreds = JSON.parse(localStorage.getItem('offlineCredentials'));
      const savedUser = JSON.parse(localStorage.getItem('offlineUser'));
      const savedToken = localStorage.getItem('offlineToken');

      if (savedCreds && savedUser && savedToken) {
        setFormData({
          employeeId: savedCreds.employeeId,
          password: savedCreds.password,
        });
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const hashedPassword = SHA256(formData.password).toString();

    //offline login logic
    if (!navigator.onLine) {
      const savedCreds = JSON.parse(localStorage.getItem('offlineCredentials'));
      const savedUser = JSON.parse(localStorage.getItem('offlineUser'));
      const savedToken = localStorage.getItem('offlineToken');

      if (
        savedCreds &&
        formData.employeeId === savedCreds.employeeId &&
        hashedPassword === savedCreds.passwordHash
      ) {
        login(savedToken, savedCreds.refreshToken, savedUser);
        return navigate('/issue-challan');
      } else {
        handleApiError(null, 'Offline login failed. Please connect to internet and login once.');
        return setLoading(false);
      }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: "include"
      });

      const data = await response.json();
      if (!response.ok) {
        handleApiError({ response: { data } });
        return;
      }

      login(data.token, data.refreshToken, data.user);

      // store for offline login
      localStorage.setItem('offlineCredentials', JSON.stringify({
        employeeId: formData.employeeId,
        passwordHash: hashedPassword,
        refreshToken: data.refreshToken,
      }));
      localStorage.setItem('offlineUser', JSON.stringify(data.user));
      localStorage.setItem('offlineToken', data.token);

      // store token and user in sessionStorage for PWA support
      sessionStorage.setItem('auth', JSON.stringify({ token: data.token, user: data.user }))

      toast.success(`Welcome, ${data.user.name || data.user.employeeId || 'User'}!`)

      setTimeout(() => {
        if (data.user.role === 'admin') navigate('/admin-dashboard');
        else if (data.user.role === 'tte') navigate('/issue-challan');
        else navigate('/');
      }, 600);

    } catch (err) {
      handleApiError(err, 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

 return (
  <div 
    className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
    style={{ fontFamily: 'Inter, sans-serif' }}
  >
    {/* main container */}
    <div className="w-full max-w-6xl h-[85vh] flex rounded-3xl overflow-hidden shadow-2xl bg-white">

      {/* left panel*/}
      <div
        className="hidden lg:flex lg:w-1/2 relative"
        style={{
          backgroundImage: `url('/loginTrain.PNG')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-800/40"></div>
      </div>

      {/* right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8 relative bg-white">
        {/* mobile bg image */}
        <div
          className="lg:hidden absolute inset-0 opacity-5 rounded-3xl"
          style={{
            backgroundImage: `url('/loginTrain.PNG')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        {/* login Card */}
        <div className="w-full max-w-sm relative z-10">
          <div className="text-center mb-6">
            {/* Page Title: Mobile 24-28px, Desktop 32-36px */}
            <h1 className="mt-3 text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Railway Portal Login
            </h1>
            {/* Secondary Text: 14px */}
            <p className="text-sm text-gray-600 leading-relaxed">
              Sign in to access your account
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-6 py-6 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                {/* Form Labels: 14-16px */}
                <label
                  htmlFor="employeeId"
                  className="block text-sm font-medium text-gray-700 mb-2 leading-normal"
                >
                  Employee ID
                </label>
                {/* Form Inputs: 16px - Critical for usability */}
                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Enter your Employee ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base leading-relaxed"
                  required
                />
              </div>

              <div>
                {/* Form Labels: 14-16px */}
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2 leading-normal"
                >
                  Password
                </label>
                {/* Form Inputs: 16px - Critical for usability */}
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base leading-relaxed"
                  required
                />
              </div>

              {/* remember me & forgot pass - Secondary Text: 14px */}
              <div className="flex items-center justify-between text-sm pt-3 leading-normal">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>

              {/* Buttons/CTAs: 16px */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-6 text-base leading-normal"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>

          {/* lang & help - Small Text: 12px */}
          <div className="text-center space-y-3 pt-5">
            <div className="flex items-center justify-center space-x-4 text-xs leading-normal">
              <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200">
                English
              </button>
              <span className="text-gray-300">|</span>
              <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200">
                हिन्दी
              </button>
              <span className="text-gray-300">|</span>
              <button className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200">
                Help
              </button>
            </div>
            {/* Small Text/Captions: 12px */}
            <p className="text-xs text-gray-500 leading-normal">
              © 2025 Indian Railways. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
