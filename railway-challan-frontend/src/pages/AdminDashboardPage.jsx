import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

//for bulk download
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const COLORS = ['#0ea5e9', '#ef4444', '#10b981', '#facc15', '#6366f1'];


const Heatmap = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    const heatLayer = L.heatLayer(
      points.map(p => [p.latitude, p.longitude, p.count || 1]),
      { radius: 25, blur: 15, maxZoom: 17 }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};


const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [challansByLocation, setChallansByLocation] = useState([]);
  const [filters, setFilters] = useState({ name: '', train: '', reason: '', date: '', status: '' });
  const [filteredChallans, setFilteredChallans] = useState([]);
  const [viewType, setViewType] = useState('card');

  // ✅ NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ✅ NEW: Derived paginated challans
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedChallans = filteredChallans.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredChallans.length / itemsPerPage);

  // ✅ NEW: State for selected challans (for bulk actions)
  const [selectedChallans, setSelectedChallans] = useState([]);

  // Function to toggle selection of a challan
  const toggleChallanSelection = (id) => {
    setSelectedChallans(prev =>
      prev.includes(id)
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  const isSelected = (id) => selectedChallans.includes(id);

  // Optional: Select All for current page
  const toggleSelectAll = () => {
    const allSelected = filteredChallans.every(challan => selectedChallans.includes(challan._id));

    if (allSelected) {
      // Deselect all
      setSelectedChallans([]);
    } else {
      // Select all from all filtered results
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

        // fetch for challan locations
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
      setCurrentPage(1); // ✅ Reset to first page on new filter
    } catch (error) {
      console.error('Filter error:', error);
    }
  };

  const clearFilters = () => {
    setFilters({ name: '', train: '', reason: '', date: '', status: '' });
    setFilteredChallans([]);
    setCurrentPage(1); // ✅ Reset page
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

  // function to download data as CSV
  const downloadCSV = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Challans');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const handleFullExport = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/challan/admin/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Full export data:', res.data);
      const challanData = res.data.data;

      if (!Array.isArray(challanData)) {
        throw new Error('Invalid data format for CSV export');
      }
      downloadCSV(challanData, 'all-challans');
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleFilteredExport = () => {
    if (filteredChallans.length === 0) {
      alert('No filtered data to export');
      return;
    }
    downloadCSV(filteredChallans, 'filtered-challans');
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


  //   const handleSelectedPDFDownload = async () => {
  //   if (selectedChallans.length === 0) return;
  //   try {
  //     const res = await axios.post(
  //       `${import.meta.env.VITE_API_URL}/api/challan/bulk-pdf`,
  //       { challanIds: selectedChallans },
  //       {
  //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  //         responseType: 'blob',
  //       }
  //     );
  //     const blob = new Blob([res.data], { type: 'application/zip' });
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = 'selected-challans.zip';
  //     link.click();
  //     window.URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error('Selected PDF download error:', err);
  //   }
  // };


  //   const handleBulkPDFDownload = async () => {
  //     try {
  //       const res = await axios.post(
  //         `${import.meta.env.VITE_API_URL}/api/challan/bulk-pdf`,
  //         { challanIds: selectedChallans },
  //         {
  //           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  //           responseType: 'blob',
  //         }
  //       );
  //       const blob = new Blob([res.data], { type: 'application/zip' });
  //       const url = window.URL.createObjectURL(blob);
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = 'challans.zip';
  //       link.click();
  //       window.URL.revokeObjectURL(url);
  //     } catch (err) {
  //       console.error('Bulk PDF download error:', err);
  //     }
  //   };


  if (!stats) return <div className="text-center mt-10">Loading dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Filter UI */}
      <div className="bg-white p-4 shadow rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Passenger Name" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} className="border p-2 rounded" />
          <input type="text" placeholder="Train Number" value={filters.train} onChange={e => setFilters({ ...filters, train: e.target.value })} className="border p-2 rounded" />
          <input type="text" placeholder="Reason" value={filters.reason} onChange={e => setFilters({ ...filters, reason: e.target.value })} className="border p-2 rounded" />
          <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} className="border p-2 rounded" />
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleFilter} className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
          <button onClick={clearFilters} className="bg-gray-300 px-4 py-2 rounded">Clear Filters</button>
          <button onClick={() => setViewType(viewType === 'card' ? 'table' : 'card')} className="bg-indigo-500 text-white px-4 py-2 rounded">
            Switch to {viewType === 'card' ? 'Table' : 'Card'} View
          </button>
        </div>
      </div>

      {/* Filtered Results */}
      {filteredChallans.length === 0 && (
  <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500 text-lg font-medium">
    ❌ No challans found matching the filter criteria. ❌
  </div>
)}
      {filteredChallans.length > 0 && (
        <>
          <div className="bg-white p-4 shadow rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Filtered Results</h2>
            {selectedChallans.length > 0 && (
              <div className="flex gap-4">
                <button
                  onClick={handleSelectedExport}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                >
                  Download Selected CSV
                </button>
              </div>
            )}

            {viewType === 'card' ? (
              <>
              <div className="px-2 pb-3 flex items-center pt-3.5 gap-1 pl-0">
                      <span className="text-left text-xs font-medium text-gray-500 uppercase">Select All</span>
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={
                          filteredChallans.length > 0 &&
                          filteredChallans.every(c => selectedChallans.includes(c._id))
                        }
                        className="w-5 h-5  text-blue-600 border-gray-300 rounded focus:ring-blue-500 "
                      />
                    </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedChallans.map((challan, idx) => (
                  <div key={idx} className="relative border rounded-xl p-4 shadow pt-6">
                    <input
                      type="checkbox"
                      checked={selectedChallans.includes(challan._id)}
                      onChange={() => toggleChallanSelection(challan._id)}
                      className="absolute top-2 right-2 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <p><span className="font-semibold">Passenger:</span> {challan.passengerName}</p>
                    <p><span className="font-semibold">Train:</span> {challan.trainNumber}</p>
                    <p><span className="font-semibold">Reason:</span> {challan.reason}</p>
                    <p><span className="font-semibold">Amount:</span> ₹{challan.fineAmount}</p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      <span className={challan.paid ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {challan.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </p>

                    <p><span className="font-semibold">Date:</span> {new Date(challan.createdAt).toLocaleDateString()}</p>
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => handleAdminDownload(challan._id)}
                    >
                      Download Receipt PDF
                    </button>

                  </div>
                ))}
              </div>
              </>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>

                    <th className="px-2 pb-3 flex items-center pt-3.5 gap-1 pl-0">
                      <span className="text-left text-xs font-medium text-gray-500 uppercase">Select All</span>
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={
                          filteredChallans.length > 0 &&
                          filteredChallans.every(c => selectedChallans.includes(c._id))
                        }
                        className="w-5 h-5  text-blue-600 border-gray-300 rounded focus:ring-blue-500 "
                      />
                    </th>

                    {/* <th className="px-4 py-3">
                      <span className="sr-only">Select</span>
                    </th> */}

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Download</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedChallans.map((challan, idx) => (
                    <tr key={idx}>

                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedChallans.includes(challan._id)}
                          onChange={() => toggleChallanSelection(challan._id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{challan.passengerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{challan.trainNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{challan.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap">₹{challan.fineAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={challan.paid ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {challan.paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">{new Date(challan.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:cursor-pointer"
                        onClick={() => handleAdminDownload(challan._id)}
                      >
                        Download Receipt PDF
                      </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* ✅ NEW: Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Total Challans</p>
          <p className="text-2xl font-semibold">{stats.totalChallans}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Total Fine Collected</p>
          <p className="text-2xl font-semibold">₹ {stats.totalFineCollected}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Paid Challans</p>
          <p className="text-xl">{stats.paidUnpaidStats.find(s => s._id === true)?.count || 0}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Unpaid Challans</p>
          <p className="text-xl">{stats.paidUnpaidStats.find(s => s._id === false)?.count || 0}</p>
        </div>
      </div>

      {/* Challans by Reason */}
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Challans by Reason</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.challansByReason}
              dataKey="count"
              nameKey="_id"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {stats.challansByReason.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 TTEs */}
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Top 5 TTEs (by challans)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.challansPerTTE}>
            <XAxis dataKey="tteName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Monthly Challan Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.monthlyTrend.map(d => ({
            month: `${d._id.month}/${d._id.year}`,
            count: d.count,
          }))}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap for Challans by Location */}
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Challan Heatmap (by Location)</h2>
        <MapContainer
          center={[19.076, 72.8777]}
          zoom={11}
          style={{ height: 400, width: '100%' }}
          minZoom={6}
          maxBounds={[[8, 68], [37, 98]]} // Rough bounds covering India
          maxBoundsViscosity={1.0} // Prevent panning outside
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Heatmap points={challansByLocation} />

        </MapContainer>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
