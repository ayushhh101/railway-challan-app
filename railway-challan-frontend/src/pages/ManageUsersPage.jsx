import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ResetPasswordModal from "../components/ResetPasswordModal";
import EditTTEProfileModal from "../components/EditTTEProfileModal";
import toast from 'react-hot-toast';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ChartBarSquareIcon,
  UserCircleIcon,
  MapPinIcon,
  PencilSquareIcon,
  KeyIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

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

  // For modals
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

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

  // Handle Edit TTE Profile
  const handleEditTTE = async (tte) => {
    setDropdownOpen(null);
    try {
      // Fetch detailed TTE profile for editing - FIXED: Added VITE_API_URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tte/admin/${tte.id}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      const result = await response.json();

      if (result.status === 'success') {
        setActiveUser(result.data.profile);
        setEditModalOpen(true);
      } else {
        toast.error(result.message || 'Failed to fetch TTE details');
      }
    } catch (err) {
      console.error('Fetch TTE details error:', err);
      toast.error('Network error occurred while fetching TTE details');
    }
  };

  // Handle successful TTE profile update
  const handleTTEUpdateSuccess = (updatedProfile) => {
    // Update the TTE in the stats list
    setTteStats(prevStats =>
      prevStats.map(tte =>
        tte.id === updatedProfile._id
          ? {
            ...tte,
            name: updatedProfile.name,
            zone: updatedProfile.zone,
            email: updatedProfile.email,
            phone: updatedProfile.phone
          }
          : tte
      )
    );
    toast.success('TTE profile updated successfully!');
    setEditModalOpen(false);
    setActiveUser(null);
  };

  const handleOpenResetModal = (tte) => {
    setDropdownOpen(null);
    setActiveUser(tte);
    setResetModalOpen(true);
  };

  const handleCloseResetModal = () => {
    setActiveUser(null);
    setResetModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setActiveUser(null);
    setEditModalOpen(false);
  };

  const handleResetSuccess = () => {
    toast.success('Password reset successfully!');
    setResetModalOpen(false);
    setActiveUser(null);
  };

  const clearFilters = () => {
    setSearch("");
    setZone("All Zones");
    setDateRange({ from: "", to: "" });
    setPage(1);
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalTTEs = filteredStats.length;
    const totalChallans = filteredStats.reduce((sum, tte) => sum + tte.issued, 0);
    const totalPaid = filteredStats.reduce((sum, tte) => sum + tte.paid, 0);
    const avgRecovery = totalTTEs > 0 ? (filteredStats.reduce((sum, tte) => sum + tte.recovery, 0) / totalTTEs).toFixed(1) : 0;

    return { totalTTEs, totalChallans, totalPaid, avgRecovery };
  }, [filteredStats]);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Loading User Analytics</h2>
          <p className="text-slate-600">Gathering performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-black mb-3">
                  User Management Portal
                </h1>
                <p className="text-lg text-blue-100 font-medium max-w-2xl">
                  Comprehensive analytics and management for ticket examining officers
                </p>
              </div>
            </div>

            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="mt-6 lg:mt-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-blue-800 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8">

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border border-blue-200/50 shadow-lg border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-2">TOTAL TC's</p>
                <p className="text-xl lg:text-2xl font-bold mb-3 leading-tight text-blue-900">{summaryStats.totalTTEs}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                <UserCircleIcon className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-6 border border-green-200/50 shadow-lg border-l-4 border-l-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wider mb-2">Total Challans</p>
                <p className="text-xl lg:text-2xl font-bold mb-3 leading-tight text-green-900">{summaryStats.totalChallans.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                <ChartBarSquareIcon className="w-12 h-12 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border border-purple-200/50 shadow-lg border-l-4 border-l-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wider mb-2">Paid Challans</p>
                <p className="text-xl lg:text-2xl font-bold mb-3 leading-tight text-purple-900">{summaryStats.totalPaid.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                <CheckBadgeIcon className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 border border-orange-200/50 shadow-lg border-l-4 border-l-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-semibold uppercase tracking-wider mb-2">Avg Recovery</p>
                <p className="text-xl lg:text-2xl font-bold mb-3 leading-tight text-orange-900">{summaryStats.avgRecovery}%</p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                <ChartBarSquareIcon className="w-12 h-12 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MagnifyingGlassIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Search & Filter TTEs</h2>
                <p className="text-slate-600">Find specific officers and analyze their performance</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">

              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Search TTE
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or employee ID"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="w-full border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 px-4 py-3 pl-12 rounded-xl text-base focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-slate-400"
                  />
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Zone
                </label>
                <div className="relative">
                  <select
                    value={zone}
                    onChange={e => { setZone(e.target.value); setPage(1); }}
                    className="w-full appearance-none border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 px-4 py-3 pr-12 rounded-xl text-base focus:outline-none focus:ring-0 transition-all duration-200 bg-white"
                  >
                    <option value="All Zones">All Zones</option>
                    {ZONES.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                  <MapPinIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Login From
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={e => { setDateRange(dr => ({ ...dr, from: e.target.value })); setPage(1); }}
                  className="w-full border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-0 transition-all duration-200"
                  max={dateRange.to || undefined}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Login To
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={e => { setDateRange(dr => ({ ...dr, to: e.target.value })); setPage(1); }}
                  className="w-full border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-0 transition-all duration-200"
                  min={dateRange.from || undefined}
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  TTE Performance Analytics
                </h2>
                <p className="text-slate-600">
                  Detailed performance metrics and account management
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-slate-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-slate-700">{paginatedStats.length} of {filteredStats.length} TTEs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-6">
              {paginatedStats.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UsersIcon className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-600 mb-2">No TTE Data Found</h3>
                  <p className="text-slate-500">Try adjusting your search criteria or filters</p>
                </div>
              ) : (
                paginatedStats.map((tte) => (
                  <div key={tte.id} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                          {tte.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl text-slate-900">
                            {tte.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <span>{tte.employeeId}</span>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <MapPinIcon className="h-4 w-4" />
                              <span>{tte.zone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === tte.id ? null : tte.id)}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5 text-slate-500" />
                        </button>

                        {dropdownOpen === tte.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-200 z-10 overflow-hidden">
                            <button
                              onClick={() => handleEditTTE(tte)}
                              className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <PencilSquareIcon className="h-4 w-4 mr-3 text-blue-500" />
                              Edit Profile
                            </button>
                            <button
                              onClick={() => handleOpenResetModal(tte)}
                              className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <KeyIcon className="h-4 w-4 mr-3 text-orange-500" />
                              Reset Password
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-2xl font-black text-slate-900">{tte.issued}</div>
                        <div className="text-xs text-slate-600 font-semibold">Total Issued</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="text-2xl font-black text-green-700">{tte.paid}</div>
                        <div className="text-xs text-green-600 font-semibold">Paid</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                        <div className="text-2xl font-black text-red-700">{tte.unpaid}</div>
                        <div className="text-xs text-red-600 font-semibold">Unpaid</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center pt-4 border-t border-slate-200">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-2 rounded-xl border border-blue-200">
                        <span className="text-blue-800 font-bold text-lg">{tte.recovery}%</span>
                        <div className="text-blue-600 text-xs font-semibold">Recovery</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      TTE Details
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Recovery Rate
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedStats.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <UsersIcon className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-lg text-slate-500 font-semibold">No TTE data available</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedStats.map((tte) => (
                      <tr key={tte.id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-200">

                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {tte.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-md font-semibold text-slate-900">
                                {tte.name}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <span className="">{tte.employeeId}</span>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <MapPinIcon className="h-4 w-4" />
                                  <span>{tte.zone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-6 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-6">
                            <div className="text-center">
                              <div className="text-xl font-semibold text-slate-900">{tte.issued}</div>
                              <div className="text-xs text-slate-600 font-semibold">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-semibold text-green-600">{tte.paid}</div>
                              <div className="text-xs text-green-600 font-semibold">Paid</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-semibold text-red-600">{tte.unpaid}</div>
                              <div className="text-xs text-red-600 font-semibold">Unpaid</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-6 whitespace-nowrap text-center">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3 rounded-2xl border border-blue-200 inline-block">
                            <span className="text-blue-800 font-semibold text-xl">{tte.recovery}%</span>
                          </div>
                        </td>

                        <td className="px-6 py-6 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2 text-slate-600">
                            <ClockIcon className="h-4 w-4" />
                            <span className="text-sm font-semibold">
                              {tte.lastLogin ? (
                                new Date(tte.lastLogin).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "2-digit"
                                })
                              ) : (
                                "Never"
                              )}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-6 whitespace-nowrap text-center">
                          <div className="relative">
                            <button
                              onClick={() => setDropdownOpen(dropdownOpen === tte.id ? null : tte.id)}
                              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 flex items-center space-x-2"
                            >
                              <span>Actions</span>
                              <EllipsisVerticalIcon className="h-4 w-4" />
                            </button>

                            {dropdownOpen === tte.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-200 z-10 overflow-hidden">
                                <button
                                  onClick={() => handleEditTTE(tte)}
                                  className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <PencilSquareIcon className="h-4 w-4 mr-3 text-blue-500" />
                                  Edit Profile
                                </button>
                                <button
                                  onClick={() => handleOpenResetModal(tte)}
                                  className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <KeyIcon className="h-4 w-4 mr-3 text-orange-500" />
                                  Reset Password
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-8 border-t-2 border-slate-200 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2 text-slate-600">
                  <span className="text-sm font-semibold">
                    Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filteredStats.length)} to {Math.min(page * ITEMS_PER_PAGE, filteredStats.length)} of {filteredStats.length} results
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
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
                          className={`w-12 h-12 rounded-xl font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${page === pageNumber
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ResetPasswordModal
        user={activeUser}
        isOpen={resetModalOpen}
        onClose={handleCloseResetModal}
        onSuccess={handleResetSuccess}
      />

      <EditTTEProfileModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        tte={activeUser}
        onUpdate={handleTTEUpdateSuccess}
      />
    </div>
  );
}