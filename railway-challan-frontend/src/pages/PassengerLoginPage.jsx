import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function PassengerLoginPage() {
  const [form, setForm] = useState({ mobileNumber: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {login} = useAuth();

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

      login(data.token, data.refreshToken || '', data.user)
      
      toast.success(`Welcome, ${data.user.name}`);
      navigate('/passenger/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-8 bg-white rounded shadow">
      <h2 className="mb-4 text-center font-bold text-blue-700">Passenger Login</h2>
      <input type="text" name="mobileNumber" placeholder="Mobile Number" value={form.mobileNumber}
        onChange={handleChange} className="mb-3 w-full p-2 border rounded" maxLength={10} required />
      <input type="password" name="password" placeholder="Password" value={form.password}
        onChange={handleChange} className="mb-4 w-full p-2 border rounded" required />
      <button type="submit" disabled={loading} className="w-full py-2 bg-blue-700 text-white rounded">
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
