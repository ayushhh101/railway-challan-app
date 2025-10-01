import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Briefcase, Building, Save, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EditTTEProfileModal = ({ isOpen, onClose, tte, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zone: '',
    currentStation: '',
    designation: '',
    dateOfJoining: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [modifiedFields, setModifiedFields] = useState(new Set());
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    if (tte) {
      const initialData = {
        name: tte.name || '',
        email: tte.email || '',
        phone: tte.phone || '',
        zone: tte.zone || '',
        currentStation: tte.currentStation || '',
        designation: tte.designation || '',
        dateOfJoining: tte.dateOfJoining ? new Date(tte.dateOfJoining).toISOString().split('T')[0] : ''
      };
      setFormData(initialData);
      setOriginalData(initialData);
      setModifiedFields(new Set());
      setErrors({});
    }
  }, [tte]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);

    // Track which fields have been modified
    const newModifiedFields = new Set(modifiedFields);
    if (value !== originalData[name]) {
      newModifiedFields.add(name);
    } else {
      newModifiedFields.delete(name);
    }
    setModifiedFields(newModifiedFields);

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 50) return 'Name must not exceed 50 characters';
        if (!/^[a-zA-Z\s.'-]+$/.test(value)) return 'Name can only contain letters, spaces, dots, apostrophes, and hyphens';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
        if (value.length > 100) return 'Email must not exceed 100 characters';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone is required';
        if (!/^[6-9][0-9]{9}$/.test(value)) return 'Phone must be a valid 10-digit Indian number starting with 6-9';
        return '';
      case 'zone':
        if (!value.trim()) return 'Zone is required';
        return '';
      case 'currentStation':
        if (!value.trim()) return 'Current station is required';
        if (value.length < 2) return 'Current station must be at least 2 characters';
        if (value.length > 50) return 'Current station must not exceed 50 characters';
        return '';
      case 'designation':
        if (!value.trim()) return 'Designation is required';
        return '';
      case 'dateOfJoining':
        if (!value) return 'Date of joining is required';
        const joiningDate = new Date(value);
        const now = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(now.getFullYear() + 1);
        if (joiningDate > oneYearFromNow) {
          return 'Date of joining cannot be more than 1 year in the future';
        }
        const minDate = new Date('1950-01-01');
        if (joiningDate < minDate) {
          return 'Date of joining cannot be before 1950';
        }
        return '';
      default:
        return '';
    }
  };

  const updateSingleField = async (fieldName) => {
    const fieldValue = formData[fieldName];
    const error = validateField(fieldName, fieldValue);
    
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
      return;
    }

    setLoading(true);
    
    try {
      const updatePayload = { [fieldName]: fieldValue };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tte/admin/${tte._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        credentials: 'include',
        body: JSON.stringify(updatePayload)
      });

      const result = await response.json();

      if (result.success) {
        onUpdate(result.data.profile);
        
        // Update original data and remove from modified fields
        const newOriginalData = { ...originalData, [fieldName]: fieldValue };
        setOriginalData(newOriginalData);
        const newModifiedFields = new Set(modifiedFields);
        newModifiedFields.delete(fieldName);
        setModifiedFields(newModifiedFields);

        // Clear any errors for this field
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
        
        // Show success message temporarily
        setErrors(prev => ({ ...prev, [`${fieldName}_success`]: 'Updated successfully!' }));
        setTimeout(() => {
          setErrors(prev => ({ ...prev, [`${fieldName}_success`]: '' }));
        }, 2000);

        toast.success(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`);
        
      } else {
        if (result.details && Array.isArray(result.details)) {
          const validationErrors = {};
          result.details.forEach(error => {
            validationErrors[error.path] = error.msg;
          });
          setErrors(validationErrors);
        } else {
          setErrors({ [fieldName]: result.message || 'Failed to update field' });
        }
        toast.error(result.message || 'Failed to update field');
      }
    } catch (error) {
      console.error('Update field error:', error);
      setErrors({ [fieldName]: 'Network error. Please try again.' });
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateAllModifiedFields = async () => {
    if (modifiedFields.size === 0) {
      setErrors({ general: 'No changes to save' });
      return;
    }

    // Validate all modified fields
    const validationErrors = {};
    modifiedFields.forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        validationErrors[fieldName] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    
    try {
      const updatePayload = {};
      modifiedFields.forEach(fieldName => {
        updatePayload[fieldName] = formData[fieldName];
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tte/admin/${tte._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        credentials: 'include',
        body: JSON.stringify(updatePayload)
      });

      const result = await response.json();

      if (result.success) {
        onUpdate(result.data.profile);
        toast.success('TTE profile updated successfully!');
        onClose();
      } else {
        if (result.details && Array.isArray(result.details)) {
          const validationErrors = {};
          result.details.forEach(error => {
            validationErrors[error.path] = error.msg;
          });
          setErrors(validationErrors);
        } else {
          setErrors({ general: result.message || 'Failed to update TTE profile' });
        }
        toast.error(result.message || 'Failed to update TTE profile');
      }
    } catch (error) {
      console.error('Update TTE profile error:', error);
      setErrors({ general: 'Network error. Please try again.' });
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const FieldUpdateButton = ({ fieldName, disabled = false }) => (
    <button
      type="button"
      onClick={() => updateSingleField(fieldName)}
      disabled={disabled || loading || !modifiedFields.has(fieldName)}
      className={`ml-3 p-2 rounded-xl transition-all duration-200 ${
        modifiedFields.has(fieldName) && !disabled && !loading
          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
      }`}
      title={modifiedFields.has(fieldName) ? 'Save this field' : 'No changes to save'}
    >
      <Save className="h-4 w-4" />
    </button>
  );

  const SuccessMessage = ({ fieldName }) => {
    if (!errors[`${fieldName}_success`]) return null;
    return (
      <div className="mt-2 flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-200">
        <Check className="h-4 w-4 mr-2" />
        {errors[`${fieldName}_success`]}
      </div>
    );
  };

  const zones = [
    "CENTRAL", "WESTERN", "HARBOUR", "TRANS-HARBOUR"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Edit TTE Profile</h2>
                <p className="text-slate-600">
                  Update individual fields or save all changes
                  {modifiedFields.size > 0 && (
                    <span className="ml-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                      {modifiedFields.size} field(s) modified
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="h-6 w-6 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Update Error</h3>
                <p className="text-red-600">{errors.general}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Name */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                <User className="inline h-5 w-5 mr-2 text-blue-600" />
                Full Name *
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-3 border-2 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.name ? 'border-red-300 bg-red-50' : 
                    modifiedFields.has('name') ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  placeholder="Enter full name"
                />
                <FieldUpdateButton fieldName="name" />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                  {errors.name}
                </p>
              )}
              <SuccessMessage fieldName="name" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                <Mail className="inline h-5 w-5 mr-2 text-blue-600" />
                Email Address *
              </label>
              <div className="flex items-center">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-3 border-2 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-300 bg-red-50' : 
                    modifiedFields.has('email') ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  placeholder="Enter email address"
                />
                <FieldUpdateButton fieldName="email" />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                  {errors.email}
                </p>
              )}
              <SuccessMessage fieldName="email" />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                <Phone className="inline h-5 w-5 mr-2 text-blue-600" />
                Phone Number *
              </label>
              <div className="flex items-center">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-3 border-2 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.phone ? 'border-red-300 bg-red-50' : 
                    modifiedFields.has('phone') ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
                <FieldUpdateButton fieldName="phone" />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                  {errors.phone}
                </p>
              )}
              <SuccessMessage fieldName="phone" />
            </div>

            {/* Zone */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                <MapPin className="inline h-5 w-5 mr-2 text-blue-600" />
                Railway Zone *
              </label>
              <div className="flex items-center">
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-3 border-2 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
                    errors.zone ? 'border-red-300 bg-red-50' : 
                    modifiedFields.has('zone') ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <option value="">Select Zone</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
                <FieldUpdateButton fieldName="zone" />
              </div>
              {errors.zone && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                  {errors.zone}
                </p>
              )}
              <SuccessMessage fieldName="zone" />
            </div>

            {/* Current Station */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                <Building className="inline h-5 w-5 mr-2 text-blue-600" />
                Current Station *
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="currentStation"
                  value={formData.currentStation}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-3 border-2 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.currentStation ? 'border-red-300 bg-red-50' : 
                    modifiedFields.has('currentStation') ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  placeholder="Enter current station"
                />
                <FieldUpdateButton fieldName="currentStation" />
              </div>
              {errors.currentStation && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                  {errors.currentStation}
                </p>
              )}
              <SuccessMessage fieldName="currentStation" />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                <Briefcase className="inline h-5 w-5 mr-2 text-blue-600" />
                Designation *
              </label>
              <div className="flex items-center">
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-3 border-2 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
                    errors.designation ? 'border-red-300 bg-red-50' : 
                    modifiedFields.has('designation') ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <option value="">Select Designation</option>
                  <option value="TTE">TTE (Traveling Ticket Examiner)</option>
                  <option value="Senior TTE">Senior TTE</option>
                  <option value="Chief TTE">Chief TTE</option>
                  <option value="Assistant TTE">Assistant TTE</option>
                  <option value="Head TTE">Head TTE</option>
                </select>
                <FieldUpdateButton fieldName="designation" />
              </div>
              {errors.designation && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                  {errors.designation}
                </p>
              )}
              <SuccessMessage fieldName="designation" />
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                <Calendar className="inline h-5 w-5 mr-2 text-blue-600" />
                Date of Joining *
              </label>
              <div className="flex items-center">
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-3 border-2 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.dateOfJoining ? 'border-red-300 bg-red-50' : 
                    modifiedFields.has('dateOfJoining') ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                  min="1950-01-01"
                />
                <FieldUpdateButton fieldName="dateOfJoining" />
              </div>
              {errors.dateOfJoining && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                  {errors.dateOfJoining}
                </p>
              )}
              <SuccessMessage fieldName="dateOfJoining" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-slate-600">
              {modifiedFields.size > 0 ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-orange-600">Unsaved changes:</span>
                  <span className="bg-orange-100 px-2 py-1 rounded-lg text-orange-700 text-xs font-semibold">
                    {Array.from(modifiedFields).join(', ')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>No pending changes</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-all duration-200 font-semibold"
              >
                Close
              </button>
              {modifiedFields.size > 0 && (
                <button
                  type="button"
                  onClick={updateAllModifiedFields}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save All Changes ({modifiedFields.size})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTTEProfileModal;