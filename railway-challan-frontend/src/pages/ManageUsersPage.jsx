import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ResetPasswordModal from "../components/ResetPasswordModal";
import toast from 'react-hot-toast';

const ZONES = ["Central", "Western", "Harbour", "Trans-Harbour"];
const ITEMS_PER_PAGE = 10;

export default function ManageUsersPage() {
  const [tteStats, setTteStats] = useState([]);
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("All Zones");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For reset password modal
  const [modalOpen, setModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/getTTEAnalytics`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setTteStats(res.data.tteStats || []);
    } catch (err) {
      console.error('Failed to load TTE analytics:', err);
      const errorMessage = err.response?.data?.message || "Failed to load TTE analytics.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredStats = useMemo(() => {
    let stats = [...tteStats];
    if (search.trim()) {
      stats = stats.filter(
        tte =>
          (tte.name && tte.name.toLowerCase().includes(search.toLowerCase())) ||
          (tte.employeeId && tte.employeeId.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (zone !== "All Zones") {
      stats = stats.filter(tte => tte.zone === zone);
    }
    if (dateRange.from || dateRange.to) {
      stats = stats.filter(tte => {
        const login = tte.lastLogin ? new Date(tte.lastLogin) : null;
        const afterFrom = dateRange.from ? login >= new Date(dateRange.from) : true;
        const beforeTo = dateRange.to ? login <= new Date(dateRange.to + "T23:59:59") : true;
        return login && afterFrom && beforeTo;
      });
    }
    return stats;
  }, [tteStats, search, zone, dateRange]);

  const totalPages = Math.ceil(filteredStats.length / ITEMS_PER_PAGE);
  const paginatedStats = filteredStats.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleOpenResetModal = (tte) => {
    setActiveUser(tte);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setActiveUser(null);
    setModalOpen(false);
  };

  const handleResetSuccess = () => {
    toast.success('Password reset successfully!');
  };

  const clearFilters = () => {
    setSearch("");
    setZone("All Zones");
    setDateRange({ from: "", to: "" });
    setPage(1);
  };

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
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          {/* Body Text: 16px */}
          <p className="text-base text-gray-600 leading-normal">Loading TTE analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 px-4 py-6 lg:px-8 lg:py-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-blue-800 leading-tight mb-2">
                User Management
              </h1>
              
              <p className="text-sm text-gray-600 leading-normal">
                Track and monitor ticket examiner performance metrics and manage user accounts
              </p>
            </div>
            
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal flex items-center space-x-2"
            >
              <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-base text-red-700 leading-normal">{error}</p>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          {/* Subsection Headings: 18px */}
          <h2 className="text-lg font-semibold text-gray-900 mb-6 leading-tight">
            Filter & Search
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* Search Input */}
            <div className="lg:col-span-2">
              {/* Form Labels: 14px */}
              <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
                Search TTE
              </label>
              {/* Form Inputs: 16px */}
              <input
                type="text"
                placeholder="Search by name or employee ID"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
              />
            </div>

            {/* Zone Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
                Zone
              </label>
              <div className="relative">
                <select
                  value={zone}
                  onChange={e => { setZone(e.target.value); setPage(1); }}
                  className="w-full appearance-none border border-gray-300 px-4 py-3 pr-10 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed bg-white"
                >
                  <option value="All Zones">All Zones</option>
                  {ZONES.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
                Login From
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={e => { setDateRange(dr => ({ ...dr, from: e.target.value })); setPage(1); }}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
                max={dateRange.to || undefined}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
                Login To
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={e => { setDateRange(dr => ({ ...dr, to: e.target.value })); setPage(1); }}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
                min={dateRange.from || undefined}
              />
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              {/* Buttons/CTAs: 16px */}
              <button
                onClick={clearFilters}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 leading-normal"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 leading-tight">
              TTE Performance Analytics
            </h2>
            <div className="mt-2 sm:mt-0">
              {/* Secondary Text: 14px */}
              <span className="text-sm text-gray-600 leading-normal">
                Showing {paginatedStats.length} of {filteredStats.length} TTEs
              </span>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {paginatedStats.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-base text-gray-500 leading-normal">No TTE data available</p>
                <p className="text-sm text-gray-400 mt-2 leading-normal">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              paginatedStats.map((tte) => (
                <div key={tte.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  
                  {/* TTE Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      {/* Body Text: 16px */}
                      <h3 className="text-base font-semibold text-gray-900 leading-normal">
                        {tte.name}
                      </h3>
                      {/* Secondary Text: 14px */}
                      <p className="text-sm text-gray-600 leading-normal">
                        {tte.employeeId} • {tte.zone}
                      </p>
                    </div>
                    
                    {/* Recovery Rate Badge */}
                    <div className="ml-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 leading-normal">
                        {tte.recovery}% Recovery
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 leading-tight">{tte.issued}</div>
                      <div className="text-xs text-gray-600 leading-normal">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 leading-tight">{tte.paid}</div>
                      <div className="text-xs text-gray-600 leading-normal">Paid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600 leading-tight">{tte.unpaid}</div>
                      <div className="text-xs text-gray-600 leading-normal">Unpaid</div>
                    </div>
                  </div>

                  {/* Last Login & Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600 leading-normal">Last Login:</span>
                      <div className="text-sm text-gray-800 leading-normal">
                        {tte.lastLogin ? (
                          new Date(tte.lastLogin).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })
                        ) : (
                          "Never"
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleOpenResetModal(tte)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Form Labels: 14px */}
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    TTE Details
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    Recovery Rate
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStats.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-base text-gray-500 leading-normal">No TTE data available</p>
                    </td>
                  </tr>
                ) : (
                  paginatedStats.map((tte) => (
                    <tr key={tte.id} className="hover:bg-gray-50 transition-colors duration-200">
                      
                      {/* TTE Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-base font-semibold text-gray-900 leading-normal">
                            {tte.name}
                          </div>
                          <div className="text-sm text-gray-500 leading-normal">
                            {tte.employeeId} • {tte.zone}
                          </div>
                        </div>
                      </td>

                      {/* Performance Stats */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-4">
                          <div>
                            <div className="text-base font-bold text-gray-900 leading-normal">{tte.issued}</div>
                            <div className="text-xs text-gray-600 leading-normal">Total</div>
                          </div>
                          <div>
                            <div className="text-base font-bold text-green-600 leading-normal">{tte.paid}</div>
                            <div className="text-xs text-gray-600 leading-normal">Paid</div>
                          </div>
                          <div>
                            <div className="text-base font-bold text-red-600 leading-normal">{tte.unpaid}</div>
                            <div className="text-xs text-gray-600 leading-normal">Unpaid</div>
                          </div>
                        </div>
                      </td>

                      {/* Recovery Rate */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 leading-normal">
                          {tte.recovery}%
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 leading-normal">
                        {tte.lastLogin ? (
                          new Date(tte.lastLogin).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })
                        ) : (
                          "Never"
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleOpenResetModal(tte)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal"
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 leading-normal">
                  Page {page} of {totalPages}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    pageNumber = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors duration-200 ${
                        page === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ResetPasswordModal
        user={activeUser}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleResetSuccess}
      />
    </div>
  );
}
