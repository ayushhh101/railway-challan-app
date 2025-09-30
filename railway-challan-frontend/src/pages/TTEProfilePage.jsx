import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  IdentificationIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyRupeeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {TrainIcon} from 'lucide-react';

export default function TTEProfilePage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentChallans, setRecentChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const toastId = toast.loading('Loading profile...');
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tte/tteProfile`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setProfile(res.data.profile);
        setStats(res.data.stats);
        setRecentChallans(res.data.recentChallans);
        toast.success('Profile loaded successfully', { id: toastId });
      } catch (err) {
        const errorMessage = err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Could not load your profile.";
        setError(errorMessage);
        toast.error(errorMessage, { id: toastId });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    const fields = ['name', 'employeeId', 'email', 'phone', 'zone', 'currentStation', 'designation', 'dateOfJoining'];
    const filledFields = fields.filter(field => profile[field] && profile[field].toString().trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Loading Profile...</p>
          <p className="text-sm text-slate-500 mt-1">Fetching your dashboard data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center max-w-md mx-auto">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200/50 rounded-2xl p-8">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-3">Profile Loading Error</h3>
            <p className="text-base text-red-700 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors duration-200"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <UserCircleIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-5xl font-black tracking-tight mb-2">
                  TTE Profile Dashboard
                </h1>
                <p className="text-lg text-blue-100 font-medium">
                  Manage your profile and monitor performance statistics
                </p>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                  <p className="text-blue-100 text-sm font-medium">Profile Completion</p>
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-3xl font-bold text-white">{profileCompletion}%</span>
                  </div>
                  <p className="text-blue-200 text-xs mt-1">of required fields</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8">
        
        {/* Enhanced Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal Information</h2>
            <p className="text-slate-600">Your profile details and contact information</p>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              
              {/* Profile Info Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
                
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-white">
                      {profile.profilePic ? (
                        <img 
                          src={profile.profilePic} 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        profile.name?.charAt(0)?.toUpperCase() || 'T'
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">
                        {profile.name || "TTE User"}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <IdentificationIcon className="w-5 h-5 text-slate-400" />
                        <span className="text-base font-semibold text-blue-600">
                          {profile.designation || "Traveling Ticket Examiner"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">Employee ID:</span>
                        <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          {profile.employeeId}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-bold border border-green-200 mt-4 sm:mt-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 lg:min-w-[350px] border border-slate-200">
                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <EnvelopeIcon className="w-5 h-5 text-slate-600" />
                  <span>Contact Information</span>
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Email:</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 break-all ml-2">
                      {profile.email || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Phone:</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {profile.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Zone:</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {profile.zone || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Station:</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {profile.currentStation || "Not assigned"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Employment Details */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-blue-800 flex items-center space-x-2">
                <IdentificationIcon className="w-5 h-5" />
                <span>Employment Details</span>
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                  <label className="text-sm font-semibold text-slate-600">Date of Joining</label>
                </div>
                <p className="text-base font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">
                  {formatDate(profile.dateOfJoining) || "Not available"}
                </p>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <UserCircleIcon className="w-4 h-4 text-slate-400" />
                  <label className="text-sm font-semibold text-slate-600">Role</label>
                </div>
                <p className="text-base font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg uppercase">
                  {profile.role || "TTE"}
                </p>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPinIcon className="w-4 h-4 text-slate-400" />
                  <label className="text-sm font-semibold text-slate-600">Zone</label>
                </div>
                <p className="text-base font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">
                  {profile.zone || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-green-800 flex items-center space-x-2">
                <InformationCircleIcon className="w-5 h-5" />
                <span>System Information</span>
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <ClockIcon className="w-4 h-4 text-slate-400" />
                  <label className="text-sm font-semibold text-slate-600">Last Login</label>
                </div>
                <p className="text-base font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">
                  {formatDateTime(profile.lastLogin)}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Account Status</label>
                <span className="inline-flex items-center px-4 py-2 rounded-xl bg-green-100 text-green-800 text-sm font-bold border border-green-200">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Active & Verified
                </span>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Profile Completion</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{profileCompletion}% Complete</span>
                    <span className="text-xs text-slate-500">8/8 fields</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        profileCompletion >= 80 ? 'bg-emerald-500' : 
                        profileCompletion >= 50 ? 'bg-orange-500' : 
                        'bg-red-500 '
                      }`} 
                      style={{width: `${profileCompletion}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Performance Statistics */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-purple-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Performance Statistics</h2>
                <p className="text-slate-600">Your challan issuance and collection metrics</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Total Challans */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-800 mb-2">
                  {stats?.total || 0}
                </div>
                <div className="text-sm text-blue-700 font-semibold uppercase tracking-wide">
                  Total Challans
                </div>
              </div>

              {/* Paid Challans */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-800 mb-2">
                  {stats?.paid || 0}
                </div>
                <div className="text-sm text-green-700 font-semibold uppercase tracking-wide">
                  Paid Challans
                </div>
              </div>

              {/* Unpaid Challans */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <XCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-red-800 mb-2">
                  {stats?.unpaid || 0}
                </div>
                <div className="text-sm text-red-700 font-semibold uppercase tracking-wide">
                  Unpaid Challans
                </div>
              </div>

              {/* Recovery Rate */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CurrencyRupeeIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-orange-800 mb-2">
                  {stats?.recovery || 0}%
                </div>
                <div className="text-sm text-orange-700 font-semibold uppercase tracking-wide">
                  Recovery Rate
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-green-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Recent Activity</h2>
                <p className="text-slate-600">Latest challans issued by you</p>
              </div>
            </div>
          </div>

          {recentChallans.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DocumentTextIcon className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Recent Challans</h3>
              <p className="text-slate-500 mb-4">You haven't issued any challans recently</p>
              <p className="text-sm text-slate-400">Issued challans will appear here for quick access</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Challan Details
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Passenger Info
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Train & Coach
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Offense
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentChallans.map((challan) => (
                      <tr key={challan._id} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-mono font-semibold text-slate-900">
                              #{challan._id.slice(-8).toUpperCase()}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-500">
                                {new Date(challan.issuedAt || challan.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-slate-900">{challan.passengerName}</p>
                            {challan.passengerAadharLast4 && (
                              <p className="text-sm text-slate-500 font-mono">****{challan.passengerAadharLast4}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <TrainIcon className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="font-semibold text-slate-900">{challan.trainNumber}</p>
                              {challan.coachNumber && (
                                <p className="text-sm text-slate-500">Coach: {challan.coachNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-slate-900 max-w-xs truncate" title={challan.reason}>
                            {challan.reason}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <CurrencyRupeeIcon className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-600">
                              {challan.fineAmount?.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {challan.paid ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold border border-green-200">
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-bold border border-red-200">
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Unpaid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden p-6 space-y-4">
                {recentChallans.map((challan) => (
                  <div key={challan._id} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Challan ID</p>
                        <p className="font-mono font-bold text-slate-900">
                          #{challan._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        {challan.paid ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            Unpaid
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Passenger</p>
                        <p className="font-semibold text-slate-900">{challan.passengerName}</p>
                        {challan.passengerAadharLast4 && (
                          <p className="text-xs text-slate-500 font-mono">****{challan.passengerAadharLast4}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Train</p>
                        <p className="font-semibold text-slate-900">{challan.trainNumber}</p>
                        {challan.coachNumber && (
                          <p className="text-xs text-slate-500">Coach: {challan.coachNumber}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Fine Amount</p>
                          <div className="flex items-center space-x-1">
                            <CurrencyRupeeIcon className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-600">
                              {challan.fineAmount?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Payment Mode</p>
                          <p className="text-sm font-semibold text-slate-900 capitalize">
                            {challan.paymentMode}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Offense</p>
                      <p className="text-sm text-slate-900">{challan.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}