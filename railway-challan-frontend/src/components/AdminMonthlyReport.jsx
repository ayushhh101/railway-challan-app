import { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00C49F'];

export default function AdminMonthlyReport() {
  const [month, setMonth] = useState('06');
  const [year, setYear] = useState('2025');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null)
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/monthly-report?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch report. Please try again.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadXLSX = () => {
    if (!report?.challans) return;
    setDownloading(true);
    const toastId = toast.loading('Preparing CSV...');
    try {
      const worksheet = XLSX.utils.json_to_sheet(report.challans);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Challans');
      const blob = new Blob([XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })], {
        type: 'application/octet-stream',
      });
      saveAs(blob, `challan-report-${month}-${year}.xlsx`);
      toast.success('Download started!', { id: toastId });
    } catch (err) {
      toast.error('Failed to generate CSV. Try again.', { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const isEmpty = (
    !report ||
    !report.stats ||
    (Array.isArray(report.challans) && report.challans.length === 0 &&
      report.stats.totalChallans === 0 &&
      report.stats.totalRevenue === 0 &&
      Object.keys(report.stats.paymentModeBreakdown || {}).length === 0 &&
      Object.keys(report.stats.reasonBreakdown || {}).length === 0 &&
      Object.keys(report.stats.stationBreakdown || {}).length === 0
    )
  );

  return (
    <div className="bg-white shadow-md rounded-xl px-2 py-5 mt-4 sm:p-6 sm:mt-6">
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
          min={2020}
          max={2099}
          value={year}
          onChange={e => setYear(e.target.value)}
          className="border px-3 py-2 rounded w-24"
        />
        <button
          aria-label="Gemerate Monthly Report"
          onClick={fetchReport}
          className="bg-[#1E40AF] text-white px-5 py-2 rounded hover:bg-blue-900"
        >
          Generate Report
        </button>
      </div>

      {loading && <p className="text-center text-gray-600">Loading...</p>}

      {error && (
        <div className="bg-white p-8 rounded-xl text-center text-red-700 font-semibold mb-6">
          {error}
        </div>
      )}

      {!loading && !error && isEmpty && (
        <div className="text-center text-gray-400 mb-3 italic">
          No report data to display. Choose a month and year and generate a report.
        </div>
      )}

      {report && !isEmpty && (
        <>
          <div className="mb-4 text-center space-y-1">
            <p className="font-semibold text-lg text-gray-800">
              Total Challans: <span className="text-blue-700">{report.stats.totalChallans}</span>
            </p>
            <p className="font-semibold text-lg text-gray-800">
              Total Revenue: ₹<span className="text-green-600">{report.stats.totalRevenue}</span>
            </p>
            <button
              aria-label="Download Monthly CSV Report"
              onClick={downloadXLSX}
              className="mt-2 text-sm text-blue-700 underline hover:text-blue-900"
              disabled={downloading}
            >
              {downloading ? "Downloading..." : "Download CSV Report"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="border rounded-lg p-3 shadow-sm bg-[#F1F5F9]">
              <h3 className="font-bold mb-2">Payment Mode Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={Object.entries(report.stats.paymentModeBreakdown).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
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

            <div className="border rounded-lg p-3 shadow-sm bg-[#F1F5F9] w-full overflow-x-auto">
              <h3 className="font-bold mb-2">Challans per Station</h3>
              <div style={{ minWidth: Math.max(400, Object.keys(report.stats.stationBreakdown).length * 75) }}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={Object.entries(report.stats.stationBreakdown).map(([name, value]) => ({ name, value }))}
                    margin={{ left: 10, right: 10 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} height={55} interval={0} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
