import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ employeeId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Login failed');

      login(data.token, data.user);

      // redirect based on role
      if (data.user.role === 'admin') navigate('/dashboard');
      else if (data.user.role === 'tte') navigate('/issue-challan');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-100">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Railway Portal Login</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="employeeId"
            type="text"
            value={formData.employeeId}
            onChange={handleChange}
            placeholder="Employee ID"
            className="p-3 border rounded-md text-sm"
            required
          />

          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="p-3 border rounded-md text-sm"
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white py-3 rounded-md font-semibold hover:bg-blue-800 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
