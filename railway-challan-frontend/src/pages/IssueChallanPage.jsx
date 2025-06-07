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
    <div className="max-w-xl mx-auto p-4 mt-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4 text-blue-800">Issue Challan</h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          type="text"
          name="trainNumber"
          placeholder="Train Number"
          value={form.trainNumber}
          onChange={handleChange}
          required
          className="input"
        />

        <input
          type="text"
          name="passengerName"
          placeholder="Passenger Name"
          value={form.passengerName}
          onChange={handleChange}
          required
          className="input"
        />

        <input
          type="text"
          name="passengerAadhar"
          placeholder="Passenger Aadhar Number"
          value={form.passengerAadhar}
          maxLength="12"
          onChange={handleChange}
          required
          className="input"
        />

        <input
          type="text"
          name="reason"
          placeholder="Reason for Challan"
          value={form.reason}
          onChange={handleChange}
          required
          className="input"
        />

        <input
          type="number"
          name="fineAmount"
          placeholder="Fine Amount"
          value={form.fineAmount}
          onChange={handleChange}
          required
          className="input"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
          className="input"
        />

        <button
          type="submit"
          className="bg-blue-700 text-white py-2 rounded-md hover:bg-blue-900 transition"
          disabled={loading}
        >
          {loading ? 'Issuing Challan...' : 'Issue Challan'}
        </button>
      </form>
    </div>
  );
}
