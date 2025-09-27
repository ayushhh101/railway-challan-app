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
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 relative"
        aria-modal="true"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          {/* Subsection Headings: 18px */}
          <h2 className="text-lg font-semibold text-gray-900 leading-tight">
            Add New User
          </h2>
          {/* Secondary Text: 14px */}
          <p className="text-sm text-gray-600 mt-1 leading-normal">
            Create a new admin or TTE account
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Name Field */}
          <div>
            {/* Form Labels: 14-16px */}
            <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="name">
              Full Name *
            </label>
            {/* Form Inputs: 16px */}
            <input
              ref={firstInputRef}
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all duration-200 leading-relaxed ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder="Enter full name"
              autoComplete="off"
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1 leading-normal">{errors.name}</p>
            )}
          </div>

          {/* Employee ID Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="employeeId">
              Employee ID *
            </label>
            <input
              id="employeeId"
              name="employeeId"
              type="text"
              value={form.employeeId}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all duration-200 leading-relaxed ${
                errors.employeeId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder="e.g., TTE12345"
              autoComplete="off"
            />
            {errors.employeeId && (
              <p className="text-xs text-red-600 mt-1 leading-normal">{errors.employeeId}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="password">
              Password *
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all duration-200 leading-relaxed ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder="Minimum 8 characters"
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1 leading-normal">{errors.password}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="role">
              Role *
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className={`w-full appearance-none px-4 py-3 pr-10 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all duration-200 bg-white leading-relaxed ${
                  errors.role ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              >
                <option value="tte">Train Ticket Examiner (TTE)</option>
                <option value="admin">Administrator</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.role && (
              <p className="text-xs text-red-600 mt-1 leading-normal">{errors.role}</p>
            )}
          </div>

          {/* Zone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="zone">
              Zone *
            </label>
            <input
              id="zone"
              name="zone"
              type="text"
              value={form.zone}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all duration-200 leading-relaxed ${
                errors.zone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder="e.g., Central, Western, Northern"
            />
            {errors.zone && (
              <p className="text-xs text-red-600 mt-1 leading-normal">{errors.zone}</p>
            )}
          </div>

          {/* API Error Display */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 leading-normal">{apiError}</p>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
          {/* Buttons/CTAs: 16px */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200 leading-normal"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200 leading-normal"
            aria-label='Add User'
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding User...
              </div>
            ) : (
              'Add User'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
