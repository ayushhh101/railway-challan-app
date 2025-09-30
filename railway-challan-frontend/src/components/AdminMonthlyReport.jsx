import { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { 
  DocumentArrowDownIcon, 
  ChartBarIcon, 
  CalendarIcon, 
  BanknotesIcon,
  TicketIcon 
} from '@heroicons/react/24/outline';

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
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black  mb-3">
                Monthly Analytics Reports
              </h1>
              <p className="text-lg text-blue-100 font-medium max-w-2xl">
                Generate comprehensive monthly reports with detailed analytics and downloadable insights
              </p>
            </div>
            <div className="mt-6 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <ChartBarIcon className="w-8 h-8 text-blue-200" />
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Reports Generated</p>
                    <p className="text-white font-bold text-lg">Live Data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8">

        {/* Enhanced Report Generator */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Report Configuration
                </h2>
                <p className="text-slate-600">
                  Select the month and year to generate comprehensive analytics
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Custom Date Range</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-end gap-6 justify-center">
              {/* Enhanced Month Selector */}
              <div className="w-full lg:w-auto">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Select Month
                </label>
                <div className="relative">
                  <select 
                    value={month} 
                    onChange={e => setMonth(e.target.value)} 
                    className="w-full lg:w-48 appearance-none border-2 border-slate-300 px-4 py-4 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white font-medium text-slate-700"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {getMonthName(String(i + 1).padStart(2, '0'))}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Enhanced Year Selector */}
              <div className="w-full lg:w-auto">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Select Year
                </label>
                <input
                  type="number"
                  min={2020}
                  max={2099}
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full lg:w-32 border-2 border-slate-300 px-4 py-4 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white font-medium text-slate-700"
                />
              </div>

              {/* Enhanced Generate Button */}
              <div className="w-full lg:w-auto">
                <button
                  onClick={fetchReport}
                  disabled={loading}
                  className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white px-10 py-4 rounded-2xl font-bold text-base shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-3"
                  aria-label="Generate Monthly Report"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating Report...</span>
                    </>
                  ) : (
                    <>
                      <ChartBarIcon className="h-5 w-5" />
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Your Report</h3>
              <p className="text-base text-slate-600">Analyzing data and generating comprehensive insights...</p>
            </div>
          </div>
        )}

        {/* Enhanced Error State */}
        {error && (
          <div className="bg-white rounded-3xl shadow-xl border border-red-200/50 p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Report Generation Failed</h3>
            <p className="text-base text-red-700 mb-6">{error}</p>
            <button
              onClick={fetchReport}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Enhanced Empty State */}
        {!loading && !error && isEmpty && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ChartBarIcon className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Data Available</h3>
            <p className="text-base text-slate-500 mb-2">
              No report data found for the selected period
            </p>
            <p className="text-sm text-slate-400">
              Try selecting a different month and year to generate insights
            </p>
          </div>
        )}

        {/* Enhanced Report Results */}
        {report && !isEmpty && (
          <div className="space-y-8">
            
            {/* Enhanced Summary Stats */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-blue-900 mb-2">
                    {getMonthName(month)} {year} Analytics Summary
                  </h2>
                  <p className="text-slate-600">
                    Comprehensive overview of challan activities and revenue metrics
                  </p>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Total Challans Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12"></div>
                    <div className="relative flex items-start justify-between">
                      <div>
                        <div className="text-3xl font-black text-blue-900 mb-2">
                          {report.stats.totalChallans}
                        </div>
                        <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                          Total Challans Issued
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Revenue Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border-2 border-green-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12"></div>
                    <div className="relative flex items-start justify-between">
                      <div>
                        <div className="text-3xl font-black text-green-900 mb-2">
                          ₹{report.stats.totalRevenue?.toLocaleString()}
                        </div>
                        <div className="text-sm font-semibold text-green-600 uppercase tracking-wider">
                          Revenue Generated
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Download Action Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8 border-2 border-purple-200/50 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12"></div>
                    <div className="relative text-center">
                      <button
                        onClick={downloadXLSX}
                        disabled={downloading}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-purple-400 disabled:to-indigo-400 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-105 disabled:transform-none flex items-center space-x-3"
                        aria-label="Download Excel Report"
                      >
                        {downloading ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Preparing...</span>
                          </>
                        ) : (
                          <>
                            <DocumentArrowDownIcon className="h-5 w-5" />
                            <span>Download Report</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Charts Section */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Detailed Analytics & Insights
                </h2>
                <p className="text-slate-600">
                  Interactive charts showing distribution patterns and trends
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  
                  {/* Enhanced Payment Mode Chart */}
                  {Object.keys(report.stats.paymentModeBreakdown || {}).length > 0 && (
                    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Payment Mode Distribution</span>
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(report.stats.paymentModeBreakdown).map(([name, value]) => ({ name, value }))}
                              cx="50%"
                              cy="50%"
                              outerRadius="75%"
                              innerRadius="35%"
                              dataKey="value"
                              label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {Object.keys(report.stats.paymentModeBreakdown).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${value} challans`, 'Count']} 
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Station Breakdown Chart */}
                  {Object.keys(report.stats.stationBreakdown || {}).length > 0 && (
                    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Station-wise Challans</span>
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(report.stats.stationBreakdown).map(([name, value]) => ({ name, value }))}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          >
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 12, fill: '#64748b' }} 
                              angle={-45} 
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip 
                              formatter={(value) => [`${value} challans`, 'Total']} 
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Bar 
                              dataKey="value" 
                              fill="url(#colorGradient)" 
                              radius={[8, 8, 0, 0]} 
                            />
                            <defs>
                              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#1e40af" stopOpacity={1}/>
                              </linearGradient>
                            </defs>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}