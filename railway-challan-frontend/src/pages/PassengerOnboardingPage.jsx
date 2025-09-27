import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

//TODO:if already onboarding token and password set hogaya, redirect to login page with message
export default function PassengerOnboardingPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [passenger, setPassenger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing onboarding token in URL.');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/passenger/onboard-verify?token=${token}`);
        setPassenger(res.data.passenger);
      } catch (err) {
        console.error('Token verification error:', err);
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to verify your onboarding link. It may be expired or invalid.');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/passenger/onboard-setpassword`, {
        token,
        password
      });

      toast.success(res.data.message || 'Password set successfully!');
      setSuccess(true);

      setTimeout(() => {
        navigate('/passenger/login');
      }, 3000);
    } catch (err) {
      console.error('Password set error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to complete onboarding. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          {/* Body Text: 16px */}
          <p className="text-base text-gray-600 leading-normal">Verifying onboarding token...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-full max-w-md">
          <div className="bg-white border-2 border-red-200 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {/* Section Headings: Mobile 20-22px */}
            <h2 className="text-xl font-bold text-red-800 mb-4 leading-tight">
              Onboarding Error
            </h2>
            {/* Body Text: 16px */}
            <p className="text-base text-red-700 leading-normal">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-full max-w-md">
          <div className="bg-white border-2 border-green-200 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-800 mb-4 leading-tight">
              Onboarding Complete!
            </h2>
            <p className="text-base text-green-700 leading-normal mb-2">
              You can now login using your mobile number and new password.
            </p>
            <p className="text-sm text-green-600 leading-normal">
              Redirecting to login page...
            </p>
            <div className="mt-4">
              <div className="animate-pulse flex space-x-1 justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="w-full max-w-md">
        
        {/* Onboarding Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            {/* Page Title: Mobile 24-28px, Desktop 32-36px */}
            <h1 className="text-2xl lg:text-3xl font-bold text-blue-800 leading-tight mb-2">
              Welcome Aboard!
            </h1>
            {/* Secondary Text: 14px */}
            <p className="text-sm text-gray-600 leading-normal">
              Complete your account setup
            </p>
          </div>

          {/* Welcome Message */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            {/* Body Text: 16px */}
            <p className="text-base text-blue-800 leading-normal">
              Welcome, <span className="font-semibold">{passenger?.name}</span>!
            </p>
            {/* Secondary Text: 14px */}
            <p className="text-sm text-blue-600 leading-normal mt-1">
              Please set your password to complete registration and access your dashboard.
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* New Password */}
            <div>
              {/* Form Labels: 14px */}
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
                New Password
              </label>
              {/* Form Inputs: 16px */}
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
                placeholder="Enter your new password"
                minLength={8}
                required
              />
              {/* Small Text: 12px */}
              <p className="text-xs text-gray-500 mt-1 leading-normal">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
                placeholder="Confirm your new password"
                minLength={8}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-base text-red-700 leading-normal">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            {/* Buttons/CTAs: 16px */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal flex items-center justify-center space-x-2"
              aria-label="Set password and complete onboarding"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Setting password...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2v6a2 2 0 01-2 2h-4a2 2 0 01-2-2V9a2 2 0 012-2h4zm-6 4h4" />
                  </svg>
                  <span>Complete Setup</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 leading-normal">
            🔒 Your password is encrypted and securely stored
          </p>
        </div>
      </div>
    </div>
  );
}
