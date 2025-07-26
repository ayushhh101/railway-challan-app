import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

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
        // Show friendly error messages
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
      setLoading(true);
      setError('');

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/passenger/onboard-setpassword`, {
        token,
        password
      });

      toast.success(res.data.message || 'Password set successfully!');
      setSuccess(true);

      // Optionally redirect to login after a short delay
      setTimeout(() => {
        navigate('/passenger/login');
      }, 3000);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to complete onboarding. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-lg">Loading...</div>;

  if (error) {
    return (
      <div className="max-w-md mx-auto p-8 mt-20 bg-white border border-red-200 rounded shadow text-red-700 text-center">
        <h2 className="text-xl font-bold mb-4">Onboarding Error</h2>
        <p>{error}</p>
        {/* Optionally add instructions or link to request a new onboarding link */}
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-8 mt-20 bg-white border border-green-200 rounded shadow text-green-700 text-center">
        <h2 className="text-xl font-bold mb-4">Onboarding Complete!</h2>
        <p>You can now login using your mobile number and new password.</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow rounded p-6 border border-gray-300">
      <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Passenger Onboarding</h1>

      <p className="mb-4">Welcome, <strong>{passenger.name}</strong></p>
      <p className="mb-6">Please set your password to complete registration.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter new password"
            minLength={8}
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Confirm new password"
            minLength={8}
            required
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition"
        >
          {loading ? 'Setting password...' : 'Set Password'}
        </button>
      </form>
    </div>
  );
}
