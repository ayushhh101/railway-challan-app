import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0ea5e9', '#ef4444', '#10b981', '#facc15', '#6366f1'];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="text-center mt-10">Loading dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

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
    </div>
  );
};

export default AdminDashboardPage;
