import { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

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
    setReport(null);
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/monthly-report?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data);
      toast.success('Report generated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch report. Please try again.");
      setReport(null);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  //TODO:fix fields csv download
  const downloadXLSX = () => {
    if (!report?.challans) return;
    setDownloading(true);
    const toastId = toast.loading('Preparing Excel file...');
    
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
      toast.error('Failed to generate Excel file. Try again.', { id: toastId });
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

  const getMonthName = (monthNum) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNum) - 1];
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 px-4 py-6 lg:px-8 lg:py-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          {/* Page Title: Mobile 24-28px, Desktop 32-36px */}
          <h1 className="text-2xl lg:text-4xl font-bold text-blue-800 leading-tight mb-2">
            Monthly Challan Reports
          </h1>
          {/* Secondary Text: 14px */}
          <p className="text-sm text-gray-600 leading-normal">
            Generate comprehensive monthly reports with analytics and downloadable data
          </p>
        </div>

        {/* Report Generator */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8 mb-8">
          {/* Subsection Headings: 18px */}
          <h2 className="text-lg font-semibold text-gray-900 mb-6 leading-tight">
            Report Configuration
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            {/* Month Selector */}
            <div>
              {/* Form Labels: 14px */}
              <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
                Month
              </label>
              {/* Form Inputs: 16px */}
              <select 
                value={month} 
                onChange={e => setMonth(e.target.value)} 
                className="w-full sm:w-40 border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {getMonthName(String(i + 1).padStart(2, '0'))}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
                Year
              </label>
              <input
                type="number"
                min={2020}
                max={2099}
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full sm:w-32 border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
              />
            </div>

            {/* Generate Button */}
            <div className="sm:mt-7">
              {/* Buttons/CTAs: 16px */}
              <button
                onClick={fetchReport}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold text-base shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal flex items-center space-x-2"
                aria-label="Generate Monthly Report"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-base text-gray-600 leading-normal">Generating report...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-base text-red-700 font-semibold leading-normal">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && isEmpty && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-base text-gray-500 leading-normal mb-2">
              No report data to display
            </p>
            <p className="text-sm text-gray-400 leading-normal">
              Choose a month and year and generate a report to see analytics
            </p>
          </div>
        )}

        {/* Report Results */}
        {report && !isEmpty && (
          <div className="space-y-8">
            
            {/* Summary Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 leading-tight mb-2">
                  {getMonthName(month)} {year} Report Summary
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  
                  {/* Total Challans */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="text-center">
                      <div className="text-2xl lg:text-3xl font-bold text-blue-800 leading-tight">
                        {report.stats.totalChallans}
                      </div>
                      <div className="text-sm font-medium text-blue-600 mt-1 leading-normal">
                        Total Challans
                      </div>
                    </div>
                  </div>

                  {/* Total Revenue */}
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="text-center">
                      <div className="text-2xl lg:text-3xl font-bold text-green-800 leading-tight">
                        ₹{report.stats.totalRevenue?.toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-green-600 mt-1 leading-normal">
                        Total Revenue
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 flex items-center justify-center">
                    <button
                      onClick={downloadXLSX}
                      disabled={downloading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-semibold text-base shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 leading-normal flex items-center space-x-2"
                      aria-label="Download Excel Report"
                    >
                      {downloading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Download Excel</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Payment Mode Distribution */}
              {Object.keys(report.stats.paymentModeBreakdown || {}).length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">
                    Payment Mode Distribution
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(report.stats.paymentModeBreakdown).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          outerRadius="70%"
                          innerRadius="30%"
                          dataKey="value"
                          label
                        >
                          {Object.keys(report.stats.paymentModeBreakdown).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} challans`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Station Breakdown */}
              {Object.keys(report.stats.stationBreakdown || {}).length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">
                    Challans per Station
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(report.stats.stationBreakdown).map(([name, value]) => ({ name, value }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }} 
                          angle={-45} 
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} challans`, 'Total']} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
