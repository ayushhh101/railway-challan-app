import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const initialForm = {
  name: '',
  employeeId: '',
  password: '',
  role: 'tte',
  zone: ''
};

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
    if (!isOpen) {
      setForm(initialForm);
      setErrors({});
      setApiError('');
    }
  }, [isOpen]);

  // Basic validation, only used on submit
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!form.zone.trim()) newErrors.zone = 'Zone is required';
    if (!['tte', 'admin'].includes(form.role)) newErrors.role = 'Invalid role';
    return newErrors;
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    // Optionally clear error for the current field, but don't show until submit
    setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleKeyDown = e => {
    if (e.key === 'Escape') onClose();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setApiError('');
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`, // Update if using protected route
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      setLoading(false);
      onUserAdded();
      onClose();
    } catch (err) {
      setLoading(false);
      setApiError(err.response?.data?.message || 'Error adding user');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-md"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <form
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 relative"
        onSubmit={handleSubmit}
        aria-modal="true"
        role="dialog"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New User</h2>

        <label className="block mb-2 font-medium" htmlFor="name">Name</label>
        <input
          ref={firstInputRef}
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className={`w-full p-2 mb-1 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          autoComplete="off"
        />
        {errors.name && <div className="text-red-600 text-xs mb-2">{errors.name}</div>}

        <label className="block mb-2 font-medium" htmlFor="employeeId">Employee ID</label>
        <input
          id="employeeId"
          name="employeeId"
          value={form.employeeId}
          onChange={handleChange}
          className={`w-full p-2 mb-1 border rounded focus:outline-none focus:ring-2 ${errors.employeeId ? 'border-red-500' : 'border-gray-300'}`}
          autoComplete="off"
        />
        {errors.employeeId && <div className="text-red-600 text-xs mb-2">{errors.employeeId}</div>}

        <label className="block mb-2 font-medium" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className={`w-full p-2 mb-1 border rounded focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.password && (
          <div className="text-red-600 text-xs mb-2">{errors.password}</div>
        )}

        <label className="block mb-2 font-medium" htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          className={`w-full p-2 mb-1 border rounded focus:outline-none ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="tte">TTE</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && <div className="text-red-600 text-xs mb-2">{errors.role}</div>}

        <label className="block mb-2 font-medium" htmlFor="zone">Zone</label>
        <input
          id="zone"
          name="zone"
          value={form.zone}
          onChange={handleChange}
          className={`w-full p-2 mb-1 border rounded focus:outline-none focus:ring-2 ${errors.zone ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.zone && <div className="text-red-600 text-xs mb-2">{errors.zone}</div>}

        {apiError && <div className="text-red-600 text-sm mb-2">{apiError}</div>}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={loading}
          >
            {loading ? (
              <span>
                <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24"></svg>
                Adding...
              </span>
            ) : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserModal;
