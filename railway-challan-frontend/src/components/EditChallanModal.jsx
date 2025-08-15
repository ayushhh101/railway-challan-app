import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EditChallanModal = ({ challan, onClose }) => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    trainNumber: challan.trainNumber,
    passengerName: challan.passengerName,
    passengerAadhar: challan.passengerAadhar,
    reason: challan.reason,
    fineAmount: challan.fineAmount,
    location: challan.location
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/challan/${challan._id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('Challan updated successfully!');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update challan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 opacity-100 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border">
        <h2 className="text-lg font-bold mb-4 text-[#1E40AF]">Edit Challan</h2>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-2">{success}</p>}

        <form onSubmit={handleUpdate} className="space-y-4">
          {['trainNumber', 'passengerName', 'passengerAadhar', 'reason', 'fineAmount', 'location'].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md text-sm"
              type={field === 'fineAmount' ? 'number' : 'text'}
            />
          ))}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300"
              aria-label="Cancel Changes"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#1E40AF] text-white rounded-md text-sm hover:bg-blue-900"
              aria-label="Save Changes"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditChallanModal;
