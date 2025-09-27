import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TTEProfilePage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentChallans, setRecentChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tte/tteProfile`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setProfile(res.data.profile);
        setStats(res.data.stats);
        setRecentChallans(res.data.recentChallans);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Could not load your profile."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-base text-gray-600 leading-normal">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-base text-red-700 leading-normal" role="alert">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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

  // Calculate profile completion percentage based on filled fields
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    const fields = ['name', 'employeeId', 'email', 'phone', 'zone', 'currentStation', 'designation', 'dateOfJoining'];
    const filledFields = fields.filter(field => profile[field] && profile[field].toString().trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div 
      className="min-h-screen bg-gray-50 px-4 py-6 lg:px-8 lg:py-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Page Title: Mobile 24-28px, Desktop 32-36px */}
        <div className="mb-8">
          <h1 className="text-2xl text-center lg:text-4xl font-bold text-primary-blue leading-tight">
            TC Profile Dashboard
          </h1>
          {/* Secondary Text: 14px */}
          <p className="text-center text-sm text-gray-600 mt-2 leading-normal">
            Manage your profile and view your performance statistics
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            
            {/* Profile Info Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-2xl lg:text-3xl font-bold text-white shadow-lg">
                  {profile.profilePic ? (
                    <img 
                      src={profile.profilePic} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    profile.name?.charAt(0)?.toUpperCase() || 'T'
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                    {profile.name || "TTE User"}
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold leading-normal mt-2 sm:mt-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Active
                  </span>
                </div>

                {/* Subsection Headings: 18px */}
                <h3 className="text-lg font-semibold text-blue-600 mb-2 leading-tight">
                  {profile.designation || "Traveling Ticket Examiner"}
                </h3>

                {/* Secondary Text: 14px */}
                <p className="text-sm text-gray-600 leading-normal">
                  Employee ID: <span className="font-semibold text-gray-900">{profile.employeeId}</span>
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-gray-50 rounded-lg p-4 lg:min-w-[300px]">
              {/* Subsection Headings: 18px */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  {/* Form Labels: 14px */}
                  <span className="text-sm font-medium text-gray-600 leading-normal">Email:</span>
                  {/* Body Text: 16px */}
                  <span className="text-base text-gray-900 leading-normal break-all">
                    {profile.email || "Not provided"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-gray-600 leading-normal">Phone:</span>
                  <span className="text-base text-gray-900 leading-normal">
                    {profile.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-gray-600 leading-normal">Zone:</span>
                  <span className="text-base text-gray-900 leading-normal">
                    {profile.zone || "—"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-gray-600 leading-normal">Current Station:</span>
                  <span className="text-base text-gray-900 leading-normal">
                    {profile.currentStation || "Not assigned"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Employment Details */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            {/* Subsection Headings: 18px */}
            <h3 className="text-lg font-semibold text-blue-800 mb-4 pb-3 border-b border-gray-200 leading-tight">
              Employment Details
            </h3>
            <div className="space-y-4">
              <div>
                {/* Form Labels: 14px */}
                <label className="block text-sm font-medium text-gray-600 mb-1 leading-normal">
                  Date of Joining
                </label>
                {/* Body Text: 16px */}
                <p className="text-base font-semibold text-gray-900 leading-normal">
                  {formatDate(profile.dateOfJoining) || "Not available"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 leading-normal">
                  Role
                </label>
                <p className="text-base font-semibold text-gray-900 leading-normal capitalize">
                  {profile.role.toUpperCase() || "TTE"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 leading-normal">
                  Zone
                </label>
                <p className="text-base font-semibold text-gray-900 leading-normal">
                  {profile.zone || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 pb-3 border-b border-gray-200 leading-tight">
              System Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 leading-normal">
                  Last Login
                </label>
                <p className="text-base font-semibold text-gray-900 leading-normal">
                  {formatDateTime(profile.lastLogin)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 leading-normal">
                  Account Status
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold leading-normal">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active & Verified
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 leading-normal">
                  Profile Completion
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        profileCompletion >= 80 ? 'bg-green-500' : 
                        profileCompletion >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} 
                      style={{width: `${profileCompletion}%`}}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{profileCompletion}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Statistics */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8 mb-8">
          {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
          <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100 leading-tight">
            Performance Statistics
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Challans */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              
              <div className="text-xl lg:text-2xl font-bold text-blue-800 leading-tight">
                {stats?.total || 0}
              </div>
              <div className="text-xs text-blue-700 font-semibold mt-2 uppercase tracking-wide leading-normal">
                Total Challans
              </div>
            </div>

            {/* Paid Challans */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              
              <div className="text-xl lg:text-2xl font-bold text-green-800 leading-tight">
                {stats?.paid || 0}
              </div>
              <div className="text-xs text-green-700 font-semibold mt-2 uppercase tracking-wide leading-normal">
                Paid Challans
              </div>
            </div>

            {/* Unpaid Challans */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              
              <div className="text-xl lg:text-2xl font-bold text-red-800 leading-tight">
                {stats?.unpaid || 0}
              </div>
              <div className="text-xs text-red-700 font-semibold mt-2 uppercase tracking-wide leading-normal">
                Unpaid Challans
              </div>
            </div>

            {/* Recovery Rate */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-xl lg:text-2xl font-bold text-orange-800 leading-tight">
                {stats?.recovery || 0}%
              </div>
              <div className="text-xs text-orange-700 font-semibold mt-2 uppercase tracking-wide leading-normal">
                Recovery Rate
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8">
          {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
          <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100 leading-tight">
            Recent Activity
          </h2>

          {recentChallans.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-base text-gray-500 leading-normal">No recent challans found</p>
              <p className="text-sm text-gray-400 mt-2 leading-normal">
                Your issued challans will appear here
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table - Hidden on Mobile */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                        Challan ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                        Passenger
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                        Train
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                        Offense
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentChallans.map((challan) => (
                      <tr key={challan._id} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-base font-mono text-gray-900 leading-normal">
                          #{challan._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900 leading-normal">
                          <div>
                            <div className="font-semibold">{challan.passengerName}</div>
                            {challan.passengerAadharLast4 && (
                              <div className="text-sm text-gray-500">****{challan.passengerAadharLast4}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-900 leading-normal">
                          <div>
                            <div>{challan.trainNumber}</div>
                            {challan.coachNumber && (
                              <div className="text-sm text-gray-500">Coach: {challan.coachNumber}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-base text-gray-900 leading-normal">
                          <div className="max-w-xs truncate" title={challan.reason}>
                            {challan.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-base font-bold text-gray-900 leading-normal">
                          ₹{challan.fineAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center leading-normal">
                          {challan.paid ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              Unpaid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Visible on Mobile */}
              <div className="lg:hidden space-y-4">
                {recentChallans.map((challan) => (
                  <div key={challan._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-gray-500 leading-normal">Challan ID</p>
                        <p className="text-sm font-mono font-semibold text-gray-900 leading-normal">
                          #{challan._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        {challan.paid ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
                            Unpaid
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 leading-normal">Passenger</p>
                        <p className="text-sm font-semibold text-gray-900 leading-normal">
                          {challan.passengerName}
                        </p>
                        {challan.passengerAadharLast4 && (
                          <p className="text-xs text-gray-500">****{challan.passengerAadharLast4}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 leading-normal">Train</p>
                        <p className="text-sm font-semibold text-gray-900 leading-normal">
                          {challan.trainNumber}
                        </p>
                        {challan.coachNumber && (
                          <p className="text-xs text-gray-500">Coach: {challan.coachNumber}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 leading-normal">Offense</p>
                        <p className="text-sm text-gray-900 leading-normal">
                          {challan.reason}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 leading-normal">Fine Amount</p>
                        <p className="text-sm font-bold text-gray-900 leading-normal">
                          ₹{challan.fineAmount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 leading-normal">Payment Mode</p>
                        <p className="text-sm text-gray-900 leading-normal capitalize">
                          {challan.paymentMode}
                        </p>
                      </div>
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
