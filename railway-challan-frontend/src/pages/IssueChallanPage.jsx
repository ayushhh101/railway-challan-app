import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function IssueChallanPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    trainNumber: '',
    passengerName: '',
    passengerAadhar: '',
    reason: '',
    fineAmount: '',
    location: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/challan/issue`,
        { ...form },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Challan issued successfully!');
      setForm({
        trainNumber: '',
        passengerName: '',
        passengerAadhar: '',
        reason: '',
        fineAmount: '',
        location: ''
      });

      setTimeout(() => navigate('/view-challans'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue challan');
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="max-w-xl mx-auto p-6 mt-8 bg-white shadow-lg rounded-xl border border-slate-200">
  <h2 className="text-2xl font-bold mb-6 text-[#1E40AF] text-center">Issue Challan</h2>

  {error && (
    <p className="text-[#DC2626] bg-red-50 border border-red-200 p-2 rounded mb-4 text-sm text-center">
      {error}
    </p>
  )}
  {success && (
    <p className="text-[#16A34A] bg-green-50 border border-green-200 p-2 rounded mb-4 text-sm text-center">
      {success}
    </p>
  )}

  <form onSubmit={handleSubmit} className="grid gap-5">
    <input
      type="text"
      name="trainNumber"
      placeholder="Train Number"
      value={form.trainNumber}
      onChange={handleChange}
      required
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E40AF] focus:outline-none text-sm"
    />

    <input
      type="text"
      name="passengerName"
      placeholder="Passenger Name"
      value={form.passengerName}
      onChange={handleChange}
      required
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E40AF] focus:outline-none text-sm"
    />

    <input
      type="text"
      name="passengerAadhar"
      placeholder="Passenger Aadhar Number"
      value={form.passengerAadhar}
      maxLength="12"
      onChange={handleChange}
      required
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E40AF] focus:outline-none text-sm"
    />

    <input
      type="text"
      name="reason"
      placeholder="Reason for Challan"
      value={form.reason}
      onChange={handleChange}
      required
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F59E0B] focus:outline-none text-sm"
    />

    <input
      type="number"
      name="fineAmount"
      placeholder="Fine Amount"
      value={form.fineAmount}
      onChange={handleChange}
      required
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F97316] focus:outline-none text-sm"
    />

    <input
      type="text"
      name="location"
      placeholder="Location"
      value={form.location}
      onChange={handleChange}
      required
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E40AF] focus:outline-none text-sm"
    />

    <button
      type="submit"
      disabled={loading}
      className="bg-[#1E40AF] text-white py-3 rounded-md text-sm font-medium hover:bg-blue-900 transition"
    >
      {loading ? 'Issuing Challan...' : 'Issue Challan'}
    </button>
  </form>
</div>

  );
}
