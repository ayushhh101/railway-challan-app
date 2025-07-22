import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SHA256 from 'crypto-js/sha256'
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ employeeId: '', password: '' });
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState('');

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
    // setError('');
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
        setError('Offline login failed. Try logging in online once.');
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
      if (!response.ok) throw new Error(data.message || 'Login failed');

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
      // redirect
      setTimeout(()=>{
        if (data.user.role === 'admin') navigate('/admin-dashboard');
      else if (data.user.role === 'tte') navigate('/issue-challan');
      else navigate('/');
      },600);
      
    } catch (err) {
      // setError(err.message);
      toast.error(err.message || 'Login error. Try again.')
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-8 border border-gray-400">
        <h2 className="text-3xl font-bold text-center text-[#1E40AF] mb-6">Railway Portal Login</h2>

        <form onSubmit={handleSubmit} >
          <div className='p-4'>
            <label className="block text-sm font-medium text-black mb-1">Employee ID</label>
            <input
              name="employeeId"
              type="text"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="Enter your ID"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1E40AF] focus:outline-none"
              required
            />
          </div>

          <div className='p-4'>
            <label className="block text-sm font-medium text-black mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1E40AF] focus:outline-none"
              required
            />
          </div>
{/* 
          {error && (
            <p className="text-[#DC2626] text-sm text-center bg-red-50 border border-[#FCA5A5] p-2 rounded-md">
              {error}
            </p>
          )} */}

          <button
            type="submit"
            disabled={loading}
            className="w-1/2 block mx-auto bg-[#1E40AF] hover:bg-blue-950 text-white py-3 mt-3 rounded-lg font-semibold transition-colors duration-200"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>

  );
}
