import React, { useEffect, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import {
  UserPlusIcon,
  BugAntIcon,
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

//for bulk download
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import ChallanFilters from '../components/ChallanFilters';
import SummaryCard from '../components/SummaryCard';
import ChallansByReasonChart from '../components/ChallansByReasonChart';
import TopTTEBarChart from '../components/TopTTEBarChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import ChallanHeatmap from '../components/ChallanHeatmap';
import ChallanList from '../components/ChallanList';
import { Link } from 'react-router-dom';
import AddUserModal from '../components/AddUserModal';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [challansByLocation, setChallansByLocation] = useState([]);
  const [filters, setFilters] = useState({ passenger: '', train: '', reason: '', date: '', status: '' });
  const [filteredChallans, setFilteredChallans] = useState([]);
  const [viewType, setViewType] = useState('table');
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedChallans = filteredChallans.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredChallans.length / itemsPerPage);

  // selected challans state
  const [selectedChallans, setSelectedChallans] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const toggleChallanSelection = (id) => {
    setSelectedChallans(prev =>
      prev.includes(id)
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allSelected = filteredChallans.every(challan => selectedChallans.includes(challan._id));

    if (allSelected) {
      setSelectedChallans([]);
    } else {
      setSelectedChallans(filteredChallans.map(challan => challan._id));
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      setError(null);
      setDashboardLoading(true);
      try {
        const [dashboardRes, locationRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/challan/locations`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
        ]);

        setStats(dashboardRes.data);
        setChallansByLocation(locationRes.data.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setError('Failed to fetch dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleFilter = async () => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/challan/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFilteredChallans(res.data);
      setCurrentPage(1);
      setSelectedChallans([]);
      toast.success(`Found ${res.data.length} challans`);
    } catch (error) {
      setError('Failed to fetch challans. Please try again.');
      setFilteredChallans([]);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ passenger: '', train: '', reason: '', date: '', status: '' });
    setFilteredChallans([]);
    setSelectedChallans([]);
    setCurrentPage(1);
  };

  const handleAdminDownload = async (challanId) => {
    setDownloadingId(challanId);
    const toastId = toast.loading("Preparing PDF...");
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pdf/challan/${challanId}/pdf`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `challan-${challanId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started!", { id: toastId });
    } catch (err) {
      console.error('Admin Download error:', err);
      toast.error("Could not download PDF. Try again.", { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadCSV = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Challans');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const handleSelectedExport = () => {
    const selectedData = filteredChallans.filter(challan => selectedChallans.includes(challan._id));

    if (selectedData.length === 0) {
      toast.error('No challans selected for export');
      return;
    }

    downloadCSV(selectedData, `selected-challans-${new Date().toISOString().split('T')[0]}`);
    toast.success(`Exported ${selectedData.length} challans successfully`);
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Loading Dashboard...</p>
          <p className="text-sm text-slate-500 mt-1">Fetching latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ fontFamily: 'Inter, sans-serif' }}>

      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl lg:text-3xl font-black  mb-3">
                Railway Admin Dashboard
              </h1>
              <p className="text-lg text-blue-100 font-medium max-w-2xl">
                Comprehensive oversight and management of the railway challan system with real-time analytics
              </p>
            </div>

            <div className="mt-6 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                <div className="text-center">
                  <p className="text-blue-100 text-sm font-medium">System Status</p>
                  <div className="flex items-center justify-center mt-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-white font-semibold">All Systems Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8">

        <AddUserModal
          isOpen={showAddUser}
          onClose={() => setShowAddUser(false)}
          onUserAdded={() => {
            toast.success("User added successfully!");
          }}
        />

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl"></div>
          <div className="relative">
            <SummaryCard stats={stats} loading={dashboardLoading} error={error} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Administrative Hub
                </h2>
                <p className="text-slate-600">
                  Access essential tools and system management functions
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <ChartBarIcon className="w-5 h-5" />
                  <span>4 Quick Actions Available</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              <Link to="/anomalies" className="group relative overflow-hidden">
                <div className="h-full bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-200/50 hover:border-red-300 rounded-2xl p-6 transform hover:scale-101 transition-all duration-100 hover:shadow-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl">
                      <BugAntIcon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-red-900 mb-2">
                      System Anomalies
                    </h3>
                    <p className="text-sm text-red-700 leading-relaxed">
                      Monitor suspicious activities and security threats
                    </p>
                    <div className="mt-4 flex items-center text-red-600">
                      <span className="text-xs font-semibold">View Details</span>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/audit-log" className="group relative overflow-hidden">
                <div className="h-full bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200/50 hover:border-blue-300 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl">
                      <ClipboardDocumentListIcon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900 mb-2">
                      Audit Trail
                    </h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Complete log of system activities and changes
                    </p>
                    <div className="mt-4 flex items-center text-blue-600">
                      <span className="text-xs font-semibold">View Logs</span>
                    </div>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => setShowAddUser(true)}
                className="group relative overflow-hidden h-full text-left"
              >
                <div className="h-full bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-2 border-emerald-200/50 hover:border-emerald-300 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl">
                      <UserPlusIcon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-900 mb-2">
                      User Management
                    </h3>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                      Create and manage admin and TTE accounts
                    </p>
                    <div className="mt-4 flex items-center text-emerald-600">
                      <span className="text-xs font-semibold">Add User</span>
                    </div>
                  </div>
                </div>
              </button>

              <Link to='/monthly-report' className="group relative overflow-hidden">
                <div className="h-full bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200/50 hover:border-purple-300 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl">
                      <DocumentArrowDownIcon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-purple-900 mb-2">
                      Analytics Reports
                    </h3>
                    <p className="text-sm text-purple-700 leading-relaxed">
                      Generate comprehensive monthly reports
                    </p>
                    <div className="mt-4 flex items-center text-purple-600">
                      <span className="text-xs font-semibold">Generate</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Challan Search & Management
                </h2>
                <p className="text-sm text-slate-600">
                  Advanced search, filtering, and bulk operations for challan records
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-slate-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700 animate-pulse">Live Data</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <ChallanFilters
              filters={filters}
              setFilters={setFilters}
              handleFilter={handleFilter}
              clearFilters={clearFilters}
              viewType={viewType}
              setViewType={setViewType}
            />

            {selectedChallans.length > 0 && (
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-900">
                        {selectedChallans.length} Records Selected
                      </p>
                      <p className="text-sm text-blue-600">
                        Ready for export and bulk operations
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSelectedExport}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold text-sm transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span>Export Selected</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ChallanList
          filteredChallans={filteredChallans}
          selectedChallans={selectedChallans}
          viewType={viewType}
          paginatedChallans={paginatedChallans}
          totalPages={totalPages}
          currentPage={currentPage}
          handleSelectedExport={handleSelectedExport}
          toggleSelectAll={toggleSelectAll}
          toggleChallanSelection={toggleChallanSelection}
          handleAdminDownload={handleAdminDownload}
          setCurrentPage={setCurrentPage}
          loading={loading}
          error={error}
          downloadingId={downloadingId}
        />

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black mb-2">
                  Analytics & Business Intelligence
                </h2>
                <p className="text-sm text-slate-600">
                  Real-time insights and performance metrics with interactive visualizations
                </p>
              </div>

              <button
                className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg text-sm transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mt-4 lg:mt-0 flex items-center space-x-2"
                onClick={() => {
                  toast.success("Advanced analytics export coming soon!");
                }}
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>Export Analytics</span>
              </button>
            </div>
          </div>

          <div className="p-8">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <ChallansByReasonChart
                  data={stats?.challansByReason}
                  stats={stats}
                  loading={dashboardLoading}
                  error={error}
                />
              </div>
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <MonthlyTrendChart
                  trend={stats?.monthlyTrend}
                  loading={dashboardLoading}
                  error={error}
                />
              </div>
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <TopTTEBarChart
                  stats={stats}
                  loading={dashboardLoading}
                  error={error}
                />
              </div>
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <ChallanHeatmap
                  challansByLocation={challansByLocation}
                  loading={dashboardLoading}
                  error={error}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;