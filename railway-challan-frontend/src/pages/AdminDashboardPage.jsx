import React, { useEffect, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { UserPlusIcon, BugAntIcon, ClipboardDocumentListIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
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
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center">
          <p className="text-base text-gray-600 leading-normal">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 px-4 py-6 lg:px-8 lg:py-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center lg:text-left">
          {/* Page Title: Mobile 24-28px, Desktop 32-36px */}
          <h1 className="text-2xl lg:text-4xl font-bold text-blue-800 leading-tight mb-2">
            Railway Admin Dashboard
          </h1>
          {/* Secondary Text: 14px */}
          <p className="text-sm text-gray-600 leading-normal">
            Comprehensive overview and management of the railway challan system
          </p>
        </div>

        <AddUserModal
          isOpen={showAddUser}
          onClose={() => setShowAddUser(false)}
          onUserAdded={() => {
            toast.success("User added successfully!");
          }}
        />

        {/* Summary Statistics */}
        <SummaryCard stats={stats} loading={dashboardLoading} error={error} />

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
          {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
          <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100 leading-tight">
            Administrative Actions
          </h2>
          {/* Secondary Text: 14px */}
          <p className="text-sm text-gray-600 leading-normal mb-6">
            Quick access to essential administrative functions and system management tools
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/anomalies" className="group">
              <div className="w-full bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-200 rounded-2xl p-6 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <BugAntIcon className="w-7 h-7 text-white" />
                  </div>
                  {/* Buttons/CTAs: 16px */}
                  <h3 className="text-base font-semibold text-red-800 leading-normal mb-2">
                    Anomalies
                  </h3>
                  {/* Small Text: 12px */}
                  <p className="text-xs text-red-700 leading-normal">
                    View suspicious activities
                  </p>
                </div>
              </div>
            </Link>
            
            <Link to="/audit-log" className="group">
              <div className="w-full bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 rounded-2xl p-6 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <ClipboardDocumentListIcon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-blue-800 leading-normal mb-2">
                    Audit Log
                  </h3>
                  <p className="text-xs text-blue-700 leading-normal">
                    System activities
                  </p>
                </div>
              </div>
            </Link>
            
            <button
              onClick={() => setShowAddUser(true)}
              className="w-full bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <UserPlusIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-base font-semibold text-green-800 leading-normal mb-2">
                  Add User
                </h3>
                <p className="text-xs text-green-700 leading-normal">
                  Create Admin/TTE
                </p>
              </div>
            </button>

            <Link to='/monthly-report' className="group">
              <div className="w-full bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 rounded-2xl p-6 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <DocumentArrowDownIcon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-purple-800 leading-normal mb-2">
                    Reports
                  </h3>
                  <p className="text-xs text-purple-700 leading-normal">
                    Monthly analytics
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Challan Management */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 leading-tight mb-2">
              Challan Search & Management
            </h2>
            <p className="text-sm text-gray-600 leading-normal">
              Search, filter, and manage challan records with advanced filtering options
            </p>
          </div>
          
          <ChallanFilters
            filters={filters}
            setFilters={setFilters}
            handleFilter={handleFilter}
            clearFilters={clearFilters}
            viewType={viewType}
            setViewType={setViewType}
          />

          {/* Export Selected Panel */}
          {selectedChallans.length > 0 && (
            <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {/* Body Text: 16px */}
                  <p className="text-base font-semibold text-blue-800 leading-normal">
                    {selectedChallans.length} challan(s) selected
                  </p>
                  {/* Secondary Text: 14px */}
                  <p className="text-sm text-blue-600 leading-normal">
                    Ready for bulk operations and export
                  </p>
                </div>
                {/* Buttons/CTAs: 16px */}
                <button
                  onClick={handleSelectedExport}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal flex items-center space-x-2"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  <span>Export Selected</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Challan List Results */}
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

        {/* Data Visualization */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 leading-tight mb-2">
                Analytics & Insights
              </h2>
              <p className="text-sm text-gray-600 leading-normal">
                Visual representation of challan data and performance metrics
              </p>
            </div>
            
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4 lg:mt-0 leading-normal flex items-center space-x-2"
              onClick={() => {
                toast.success("Analytics export feature coming soon!");
              }}
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>Export Analytics</span>
            </button>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChallansByReasonChart 
              data={stats?.challansByReason} 
              stats={stats} 
              loading={dashboardLoading} 
              error={error} 
            />
            <MonthlyTrendChart 
              trend={stats?.monthlyTrend} 
              loading={dashboardLoading} 
              error={error} 
            />
            <TopTTEBarChart 
              stats={stats} 
              loading={dashboardLoading} 
              error={error} 
            />
            <ChallanHeatmap 
              challansByLocation={challansByLocation} 
              loading={dashboardLoading} 
              error={error} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
