import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

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
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl pl-0 sm:pl-5 font-bold text-gray-800 text-center sm:text-left">
          Admin Dashboard
        </h1>
        <div className='flex gap-2 justify-center sm:justify-end'>
          <Link to="/anomalies">
            <h1 className="text-base font-bold text-red-800 border border-red-800 bg-red-100 rounded-2xl px-2 py-1 sm:p-2">Anomalies</h1>
          </Link>
          <Link to="/audit-log">
            <h1 className="text-base font-bold text-[#1E40AF] border border-blue-800 bg-blue-100 rounded-2xl px-2 py-1 sm:p-2">Audit Log</h1>
          </Link>
        </div>
      </div>

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

      <Link to='/monthly-report'>
        <button className="bg-[#1E40AF] text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded hover:bg-blue-900 transition">
          📅 View Monthly Report
        </button>
      </Link>

      <ChallansByReasonChart data={stats.challansByReason} stats={stats} />

      <TopTTEBarChart stats={stats} />

      <MonthlyTrendChart trend={stats.monthlyTrend} />

      <ChallanHeatmap challansByLocation={challansByLocation} />

    </div>
  );
};

export default AdminDashboardPage;
