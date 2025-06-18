import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { saveOfflineChallan, getAllOfflineChallans, clearOfflineChallans } from '../utils/db';
import TextInput from '../components/TextInput';

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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Sync offline challans when back online
  useEffect(() => {
    const syncOfflineChallans = async () => {
      if (navigator.onLine) {
        const pending = await getAllOfflineChallans();
        const failedLogs = [];

        for (const challan of pending) {
          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL}/api/challan/issue`,
              challan,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          } catch (err) {
            console.error('Sync failed for challan:', challan, err);
            failedLogs.push({ challan, error: err.message });
          }
        }

        await clearOfflineChallans();

        // ✅ Store sync failures in localStorage for debugging
        if (failedLogs.length > 0) {
          localStorage.setItem('syncErrors', JSON.stringify(failedLogs));
        } else {
          localStorage.removeItem('syncErrors');
        }
      }
    };

    // ✅ Listen for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineChallans();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const challanData = {
      ...form,
      issuedBy: user?._id,
      date: new Date().toISOString()
    };


    try {
      if (!navigator.onLine) {
        await saveOfflineChallan(challanData);
        setSuccess('Challan saved offline. Will sync when back online.');
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/challan/issue`,
          challanData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccess('Challan issued successfully!');
      }
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

       {/* ✅ Show Offline Badge */}
      {isOffline && (
        <p className="text-center w-full text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-300 rounded p-2 mb-4">
          ⚠️ You are currently offline. Submitted challans will be saved locally.
        </p>
      )}

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
        <TextInput name="trainNumber" placeholder="Train Number" value={form.trainNumber} onChange={handleChange} />
        <TextInput name="passengerName" placeholder="Passenger Name" value={form.passengerName} onChange={handleChange} />
        <TextInput name="passengerAadhar" placeholder="Passenger Aadhar Number" value={form.passengerAadhar} onChange={handleChange} maxLength={12} />
        <TextInput name="reason" placeholder="Reason for Challan" value={form.reason} onChange={handleChange} />
        <TextInput name="fineAmount" placeholder="Fine Amount" type="number" value={form.fineAmount} onChange={handleChange} />
        <TextInput name="location" placeholder="Location" value={form.location} onChange={handleChange} />

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
