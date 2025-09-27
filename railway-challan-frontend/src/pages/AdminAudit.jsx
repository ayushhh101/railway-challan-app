import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminAudit = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedLogs = logs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/getAllAudits`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data.audits);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
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

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          {/* Body Text: 16px */}
          <p className="text-base text-gray-600 leading-normal">Loading audit logs...</p>
        </div>
      </div>
    );
  }

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
            Audit Logs
          </h1>
          {/* Secondary Text: 14px */}
          <p className="text-sm text-gray-600 leading-normal">
            Monitor system activities and user actions for security and compliance
          </p>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {/* Section Headings: Mobile 20-22px */}
          <h2 className="text-xl font-semibold text-blue-800 mb-6 leading-tight">
            Recent Activities
          </h2>
          
          <div className="space-y-4">
            {paginatedLogs.map((log) => (
              <div key={log._id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    {/* Body Text: 16px */}
                    <h3 className="text-base font-semibold text-gray-900 leading-normal">
                      {log.action}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border leading-normal ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                </div>

                {/* Card Details */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      {/* Form Labels: 14px */}
                      <span className="text-sm font-medium text-gray-600 leading-normal">User:</span>
                      {/* Body Text: 16px */}
                      <p className="text-base text-gray-900 leading-normal">
                        {log.performedBy?.name || 'Unknown'}
                      </p>
                      {/* Secondary Text: 14px */}
                      <p className="text-sm text-gray-600 leading-normal">
                        {log.performedBy?.employeeId}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 leading-normal">Role:</span>
                      <p className="text-base text-gray-900 leading-normal capitalize">
                        {log.role}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-600 leading-normal">Severity:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ml-2 leading-normal ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-600 leading-normal">Date:</span>
                    <p className="text-sm text-gray-700 leading-normal">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {log.userAgent && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 leading-normal">User Agent:</span>
                      <p className="text-xs text-gray-600 leading-normal break-all">
                        {log.userAgent}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 leading-tight">
              System Audit Trail
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Form Labels: 14px */}
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    Role
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    User Agent
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider leading-normal">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors duration-200">
                    {/* Body Text: 16px */}
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900 leading-normal">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-base font-semibold text-gray-900 leading-normal">
                          {log.performedBy?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 leading-normal">
                          {log.performedBy?.employeeId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900 leading-normal capitalize">
                      {log.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border leading-normal ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border leading-normal ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-600 leading-normal">
                      {log.userAgent || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 leading-normal">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              {/* Secondary Text: 14px */}
              <span className="text-sm text-gray-600 leading-normal">
                Showing <span className="font-semibold">{indexOfFirst + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(indexOfLast, logs.length)}</span> of{' '}
                <span className="font-semibold">{logs.length}</span> results
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Buttons/CTAs: 16px */}
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 leading-normal"
                aria-label="Previous Page"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <span className="text-sm text-gray-600 leading-normal">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 leading-normal"
                aria-label="Next Page"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAudit;
