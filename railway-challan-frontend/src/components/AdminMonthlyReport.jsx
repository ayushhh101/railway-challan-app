import { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00C49F'];

export default function AdminMonthlyReport() {
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('2025');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/monthly-report?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data);
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadXLSX = () => {
    if (!report?.challans) return;
    const worksheet = XLSX.utils.json_to_sheet(report.challans);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Challans');
    const blob = new Blob([XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })], {
      type: 'application/octet-stream',
    });
    saveAs(blob, `challan-report-${month}-${year}.xlsx`);
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-10">
      <h2 className="text-xl font-bold text-[#1E40AF] mb-4 text-center">📊 Monthly Challan Report</h2>

      <div className="flex gap-4 mb-6 items-center flex-wrap justify-center">
        <select value={month} onChange={e => setMonth(e.target.value)} className="border px-3 py-2 rounded">
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
              {String(i + 1).padStart(2, '0')}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={e => setYear(e.target.value)}
          className="border px-3 py-2 rounded w-24"
        />
        <button
          onClick={fetchReport}
          className="bg-[#1E40AF] text-white px-5 py-2 rounded hover:bg-blue-900"
        >
          Generate Report
        </button>
      </div>

      {loading && <p className="text-center text-gray-600">Loading...</p>}

      {report && (
        <>
          <div className="mb-4 text-center">
            <p className="font-semibold text-lg text-gray-800">
              Total Challans: <span className="text-blue-700">{report.stats.totalChallans}</span>
            </p>
            <p className="font-semibold text-lg text-gray-800">
              Total Revenue: ₹<span className="text-green-600">{report.stats.totalRevenue}</span>
            </p>
            <button
              onClick={downloadXLSX}
              className="mt-2 text-sm text-blue-700 underline hover:text-blue-900"
            >
              Download CSV Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="font-bold mb-2">Payment Mode Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={Object.entries(report.stats.paymentModeBreakdown).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label
                  >
                    {Object.keys(report.stats.paymentModeBreakdown).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="font-bold mb-2">Challans per Station</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={Object.entries(report.stats.stationBreakdown).map(([name, value]) => ({ name, value }))}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#1E40AF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
