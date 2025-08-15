import React, { useEffect, useState } from "react";
import axios from "axios";

// Password reset modal component
export default function ResetPasswordModal({ user, isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setConfirm('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/reset-password`,
        { userId: user.id, newPassword: password },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setLoading(false);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Error resetting password');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm"
        onSubmit={handleSubmit}
        aria-modal="true"
        role="dialog"
      >
        <h3 className="text-lg font-bold mb-5 text-blue-900">
          Reset Password for {user.name}
        </h3>
        <label className="block mb-1 font-medium">New Password</label>
        <input
          type="password"
          className="w-full p-2 mb-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <label className="block mb-1 font-medium">Confirm Password</label>
        <input
          type="password"
          className="w-full p-2 mb-2 border rounded"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />
        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
        <div className="flex gap-2 mt-4 justify-end">
          <button type="button" onClick={onClose} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded" aria-label="Reset password">
            {loading ? 'Resetting...' : 'Reset'}
          </button>
        </div>
      </form>
    </div>
  );
}

