import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserIcon,
  ComputerDesktopIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

//TODO:pagination for logs, passenger login fix
const AdminAudit = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const itemsPerPage = 12;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = !filterSeverity || log.severity === filterSeverity;
    const matchesStatus = !filterStatus || log.status === filterStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const paginatedLogs = filteredLogs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  useEffect(() => {
    const fetchLogs = async () => {
      const toastId = toast.loading('Loading audit logs...');
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/getAllAudits`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data.audits);
        toast.success(`Loaded ${res.data.audits.length} audit logs`, { id: toastId });
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        toast.error('Failed to load audit logs', { id: toastId });
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILURE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircleIcon className="w-4 h-4" />;
      case 'FAILURE': return <XCircleIcon className="w-4 h-4" />;
      default: return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSeverity('');
    setFilterStatus('');
    setCurrentPage(1);
    toast.success('Filters cleared');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Loading Audit Logs...</p>
          <p className="text-sm text-slate-500 mt-1">Analyzing security events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-black mb-2">
                  Security Audit Logs
                </h1>
                <p className="text-lg text-slate-100 font-medium">
                  Monitor system activities and user actions for security compliance
                </p>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                <div className="text-center">
                  <p className="text-slate-100 text-sm font-normal">Total Events</p>
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-2xl font-bold text-white">{logs.length}</span>
                  </div>
                  <p className="text-slate-200 text-xs mt-1">audit records</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8">
        
        {/* Enhanced Filters */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MagnifyingGlassIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Filter & Search Logs
                </h2>
                <p className="text-slate-600">
                  Find specific audit events using advanced filters
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              
              {/* Search Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Search Actions/Users
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search actions, users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white focus:ring-0 transition-all duration-200 outline-none text-base placeholder:text-slate-400"
                  />
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Severity Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Severity Level
                </label>
                <div className="relative">
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full appearance-none border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 pr-12 bg-white focus:ring-0 transition-all duration-200 outline-none text-base"
                  >
                    <option value="">All Severities</option>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Action Status
                </label>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full appearance-none border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 pr-12 bg-white focus:ring-0 transition-all duration-200 outline-none text-base"
                  >
                    <option value="">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILURE">Failure</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Actions
                </label>
                <button
                  onClick={clearFilters}
                  className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-4 py-3 rounded-xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Filter Summary */}
            {(searchTerm || filterSeverity || filterStatus) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      Active Filters: Showing {filteredLogs.length} of {logs.length} records
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  System Audit Trail
                </h2>
                <p className="text-slate-600">
                  {filteredLogs.length > 0 
                    ? `Showing ${indexOfFirst + 1}-${Math.min(indexOfLast, filteredLogs.length)} of ${filteredLogs.length} audit events`
                    : 'No audit events found'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {filteredLogs.length > 0 ? (
              <div className="p-6 space-y-4">
                {paginatedLogs.map((log) => (
                  <div key={log._id} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
                    
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-slate-900 mb-1">
                          {log.action}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <ClockIcon className="w-4 h-4" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          <span>{log.status}</span>
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(log.severity)}`}>
                          {log.severity?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">User</span>
                        </div>
                        <p className="text-base font-semibold text-slate-900">
                          {log.performedBy?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {log.performedBy?.employeeId}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm font-medium text-slate-600">Role</span>
                        </div>
                        <p className="text-base font-semibold text-slate-900 capitalize">
                          {log.role}
                        </p>
                      </div>
                    </div>

                    {log.userAgent && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <ComputerDesktopIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">Device</span>
                        </div>
                        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 break-all">
                          {log.userAgent}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Audit Events Found</h3>
                <p className="text-slate-500">No audit events match your current filter criteria.</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            {filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Action & Time
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Device Info
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-bold text-slate-900 mb-1">{log.action}</p>
                            <div className="flex items-center space-x-2 text-sm text-slate-500">
                              <CalendarDaysIcon className="w-4 h-4" />
                              <span>{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {log.performedBy?.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-slate-500">
                                {log.performedBy?.employeeId} • {log.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(log.status)}`}>
                            {getStatusIcon(log.status)}
                            <span>{log.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getSeverityColor(log.severity)}`}>
                            {log.severity?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="max-w-xs">
                            <p className="text-sm text-slate-600 truncate">
                              {log.userAgent || 'Not available'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Audit Events Found</h3>
                <p className="text-slate-500 mb-6">No audit events match your current filter criteria.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-slate-700">
                    Showing <span className="font-bold">{indexOfFirst + 1}</span> to{' '}
                    <span className="font-bold">{Math.min(indexOfLast, filteredLogs.length)}</span> of{' '}
                    <span className="font-bold">{filteredLogs.length}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    aria-label="Previous Page"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    aria-label="Next Page"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAudit;