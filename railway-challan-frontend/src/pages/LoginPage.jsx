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

      setTimeout(() => {
        if (data.user.role === 'admin') navigate('/admin-dashboard');
        else if (data.user.role === 'tte') navigate('/issue-challan');
        else navigate('/');
      }, 600);

    } catch (err) {
      toast.error(err.message || 'Login error. Try again.')
    } finally {
      setLoading(false);
    }
  };

  return ( 
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 md:px-8 py-8 md:py-12  font-sans">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-6 border border-neutral-gray400">
        <h2 className="text-3xl font-bold text-center text-primary-blue mb-4 md:mb-6"
        >Railway Portal Login</h2>


        <form onSubmit={handleSubmit} >
          <div className='p-2 md:p-4'>
            <label className="block text-sm md:text-base font-medium text-neutral-gray900 mb-1">Employee ID</label>
            <input
              name="employeeId"
              type="text"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="Enter your ID"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 md:px-4 md:py-4 text-sm md:text-base font-normal focus:ring-2 focus:ring-[#1E40AF] focus:outline-none"
              required
            />
          </div>

          <div className='p-2 md:p-4'>
            <label className="block text-sm font-medium md:text-base  text-neutral-gray900 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 md:px-4 md:py-4 text-sm md:text-base font-normal focus:ring-1 focus:ring-[#1E40AF] focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-1/2 block mx-auto bg-primary-blue hover:bg-primary-dark text-white py-3 md:py-4 mt-3 md:mt-4 rounded-2xl font-medium text-base transition-colors duration-200 font-sans"
            aria-label="Login"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
