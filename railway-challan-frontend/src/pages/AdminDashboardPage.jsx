import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { UserPlusIcon, BugAntIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

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


const COLORS = ['#0ea5e9', '#ef4444', '#10b981', '#facc15', '#6366f1'];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [challansByLocation, setChallansByLocation] = useState([]);
  const [filters, setFilters] = useState({ name: '', train: '', reason: '', date: '', status: '' });
  const [filteredChallans, setFilteredChallans] = useState([]);
  const [viewType, setViewType] = useState('card');

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedChallans = filteredChallans.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredChallans.length / itemsPerPage);

  // selected challans state
  const [selectedChallans, setSelectedChallans] = useState([]);
  const [reportMonth, setReportMonth] = useState('');
  const [reportYear, setReportYear] = useState('');
  const [monthlyReport, setMonthlyReport] = useState(null);

  const [showAddUser, setShowAddUser] = useState(false);

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
      // deselect all
      setSelectedChallans([]);
    } else {
      setSelectedChallans(filteredChallans.map(challan => challan._id));
    }
  };


  useEffect(() => {
    const fetchStats = async () => {
      try {
        // fetch admin stats
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setStats(res.data);

        const locationRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/challan/locations`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setChallansByLocation(locationRes.data);

      } catch (err) {
        console.error('Error fetching admin stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleFilter = async () => {
    try {
      const params = new URLSearchParams(filters);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/challan/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFilteredChallans(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Filter error:', error);
    }
  };

  const clearFilters = () => {
    setFilters({ name: '', train: '', reason: '', date: '', status: '' });
    setFilteredChallans([]);
    setCurrentPage(1);
  };

  // admin download challan pdf
  const handleAdminDownload = async (challanId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pdf/challan/${challanId}/pdf`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    } catch (err) {
      console.error('Admin Download error:', err);
      alert('Download failed');
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
    const allSelectedAcrossPages =
      filteredChallans.length > 0 &&
      selectedChallans.length === filteredChallans.length;

    const selectedData = allSelectedAcrossPages
      ? filteredChallans // download all filtered challans
      : filteredChallans.filter(challan => selectedChallans.includes(challan._id));

    if (selectedData.length === 0) {
      alert('No selected challans to export');
      return;
    }

    downloadCSV(selectedData, 'selected-challans');
  };

  const handleMonthlyReport = async () => {
    if (!reportMonth || !reportYear) return alert('Please select both month and year');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/monthly-report?month=${reportMonth}&year=${reportYear}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMonthlyReport(res.data);
    } catch (err) {
      console.error('Monthly report error:', err);
      alert('Failed to fetch monthly report');
    }
  };

  if (!stats) return <div className="text-center mt-10">Loading dashboard...</div>;

  return (
    <div className=" max-w-7xl mx-auto  px-4 pt-8 pb-12 space-y-10 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
        <h1 className="text-3xl pl-0 sm:pl-5 font-bold text-gray-800 text-center sm:text-left">
          Admin Dashboard
        </h1>
      </div>

      <AddUserModal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        onUserAdded={() => {
          //TODO:
        }}
      />

      <ChallanFilters
        filters={filters}
        setFilters={setFilters}
        handleFilter={handleFilter}
        clearFilters={clearFilters}
        viewType={viewType}
        setViewType={setViewType}
      />

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
      />

      <SummaryCard stats={stats} />

      <div className="flex flex-wrap gap-2 mb-6 justify-start">
        <Link to="/anomalies">
          <button
            className="rounded-lg bg-red-50 text-red-800 border border-red-200 px-4 py-2 font-semibold text-sm hover:bg-red-100 transition shadow-sm"
          >
            <BugAntIcon className="w-5 h-5 mr-2 inline" />
            Anomalies
          </button>
        </Link>
        <Link to="/audit-log">
          <button
            className="rounded-lg bg-blue-50 text-blue-800 border border-blue-200 px-4 py-2 font-semibold text-sm hover:bg-blue-100 transition shadow-sm"
          >
            <ClipboardDocumentListIcon className="w-5 h-5 mr-2 inline" />
            Audit Log
          </button>
        </Link>
        <button
          className="rounded-lg bg-blue-600 text-white font-semibold px-4 py-2 text-sm hover:bg-blue-800 transition shadow-sm"
          onClick={() => setShowAddUser(true)}
        >
          <UserPlusIcon className="w-5 h-5 mr-2 inline" />
          Add Admin/TTE
        </button>
      </div>


      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 px-4 sm:px-10 py-7 my-8">
        {/* Title row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Data Visualization</h2>
          <button
            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition text-sm w-fit"
            onClick={() => {
              // TODO: Add your export handler here, e.g. exportAnalyticsData()
            }}
          >
            Export Data
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl px-4 sm:px-6 py-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="w-full h-full">
              <ChallansByReasonChart data={stats?.challansByReason} stats={stats} />
            </div>
          </div>
          <div className="bg-white rounded-xl px-4 sm:px-6 py-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="w-full h-full">
              <MonthlyTrendChart trend={stats?.monthlyTrend} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl px-4 sm:px-6 py-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="w-full h-full">
              <TopTTEBarChart stats={stats} />
            </div>
          </div>
          <div className="bg-white rounded-xl px-4 sm:px-6 py-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="w-full h-full">
              <ChallanHeatmap challansByLocation={challansByLocation} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
