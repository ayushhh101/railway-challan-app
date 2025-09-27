import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CalendarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Dismissed', value: 'dismissed' }
];

const AdminAnomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchAnomalies();
  }, [user]);

  const fetchAnomalies = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/anomalies`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.anomalies) {
        setAnomalies(res.data.anomalies);
      } else {
        setAnomalies([]);
      }
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch anomalies';
      setError(errorMessage);
      toast.error(errorMessage);
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  };

  const { filteredAnomalies, totalPages, tabCounts } = useMemo(() => {
    const counts = { all: anomalies.length, pending: 0, resolved: 0, dismissed: 0 };
    
    for (let a of anomalies) {
      if (counts[a.status] !== undefined) counts[a.status]++;
    }

    const filtered = activeTab === 'all' ? anomalies : anomalies.filter(a => a.status === activeTab);

    return { 
      filteredAnomalies: filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage),
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      tabCounts: counts
    }
  }, [anomalies, activeTab, page]);

  const handleUpdateAnomaly = async (anomalyId, newStatus) => {
    if (updatingId === anomalyId) return; // Prevent double clicks

    setUpdatingId(anomalyId);
    const toastId = toast.loading(`Updating anomaly to ${newStatus}...`);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Make the API call with status in URL params as originally intended
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/anomalies/${anomalyId}/${newStatus}`,
        {}, // Empty body
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state
      const updatedAnomalies = anomalies.map(anomaly =>
        anomaly._id === anomalyId ? { ...anomaly, status: newStatus } : anomaly
      );
      setAnomalies(updatedAnomalies);
      
      // Reset page if needed
      const currentTabFiltered = activeTab === 'all' ? updatedAnomalies : updatedAnomalies.filter(a => a.status === activeTab);
      const newTotalPages = Math.ceil(currentTabFiltered.length / itemsPerPage);
      if (page > newTotalPages && newTotalPages > 0) {
        setPage(newTotalPages);
      }

      toast.success(`Anomaly ${newStatus} successfully`, { id: toastId });
    }
    catch (error) {
      console.error('Error updating anomaly:', error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${newStatus} anomaly`;
      toast.error(errorMessage, { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  // Retry function for error state
  const handleRetry = () => {
    fetchAnomalies();
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
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          {/* Body Text: 16px */}
          <p className="text-base text-gray-600 leading-normal">Loading anomalies...</p>
        </div>
      </div>
    );
  }

  if (error && anomalies.length === 0) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2 leading-tight">
              Failed to Load Anomalies
            </h3>
            <p className="text-base text-red-700 leading-normal mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 leading-normal"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen bg-gray-50 px-4 py-6 lg:px-8 lg:py-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          {/* Page Title: Mobile 24-28px, Desktop 32-36px */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-blue-800 leading-tight mb-2">
                Anomaly Management
              </h1>
              {/* Secondary Text: 14px */}
              <p className="text-sm text-gray-600 leading-normal">
                Monitor and manage system-detected anomalies and suspicious activities
              </p>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchAnomalies}
              disabled={loading}
              className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal flex items-center space-x-2"
            >
              <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base leading-normal transition-colors duration-200 ${
                    activeTab === tab.value
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setPage(1);
                  }}
                >
                  {tab.label}
                  <span className={`ml-2 font-semibold rounded-full py-1 px-3 text-xs ${
                    activeTab === tab.value
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tabCounts[tab.value]}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Anomalies List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
          <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 leading-tight">
            {activeTab === 'all' ? 'All Anomalies' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Anomalies`}
          </h2>

          {filteredAnomalies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-gray-400" />
              </div>
              {/* Body Text: 16px */}
              <p className="text-base text-gray-500 leading-normal">
                {activeTab === 'all' ? "No anomalies detected." : `No ${activeTab} anomalies.`}
              </p>
              {/* Secondary Text: 14px */}
              <p className="text-sm text-gray-400 mt-2 leading-normal">
                The system will display anomalies here when they are detected
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAnomalies.map(anomal => (
                <div
                  key={anomal._id}
                  className="relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    
                    {/* Anomaly Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        anomal.status === 'pending' 
                          ? 'bg-red-100 border border-red-200'
                          : anomal.status === 'resolved'
                          ? 'bg-green-100 border border-green-200'
                          : 'bg-gray-100 border border-gray-200'
                      }`}>
                        <ExclamationTriangleIcon className={`h-6 w-6 ${
                          anomal.status === 'pending' 
                            ? 'text-red-600'
                            : anomal.status === 'resolved'
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`} />
                      </div>
                    </div>

                    {/* Anomaly Details */}
                    <div className="flex-1 min-w-0">
                      
                      {/* Message and Status */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                        <div className="flex-1">
                          {/* Body Text: 16px */}
                          <h3 className="text-base font-semibold text-gray-900 leading-normal mb-2">
                            {anomal.message}
                          </h3>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="mt-2 sm:mt-0 sm:ml-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold leading-normal ${
                            anomal.status === "pending" 
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : anomal.status === "resolved"
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {anomal.status.charAt(0).toUpperCase() + anomal.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2">
                        {anomal.user && (anomal.user._id || anomal.user.name) && (
                          <div className="flex flex-wrap items-center">
                            {/* Form Labels: 14px */}
                            <span className="text-sm font-medium text-gray-600 mr-2 leading-normal">
                              Issued By:
                            </span>
                            {/* Body Text: 16px */}
                            <span className="text-base text-gray-900 leading-normal">
                              {anomal.user.name || 'Unknown User'} 
                              {anomal.user._id && anomal.user._id !== anomal.user.name && (
                                <span className="text-gray-500"> ({anomal.user._id})</span>
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                          {/* Created Date */}
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                            {/* Small Text: 12px */}
                            <span className="text-xs text-gray-500 leading-normal">
                              Created on {new Date(anomal.createdAt).toLocaleString('en-GB', {
                                day: "2-digit",
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Related Challan */}
                          {anomal.challan?._id && (
                            <div>
                              <span className="text-xs text-gray-500 leading-normal">
                                Related Challan:{' '}
                                <a
                                  href={`/challans/${anomal.challan._id}`}
                                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                                >
                                  {anomal.challan.code || anomal.challan._id.slice(-8)}
                                </a>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0">
                      {anomal.status === "pending" && (
                        <div className="flex flex-row lg:flex-col gap-3">
                          {/* Buttons/CTAs: 16px */}
                          <button
                            onClick={() => handleUpdateAnomaly(anomal._id, "resolved")}
                            disabled={updatingId === anomal._id}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-6 py-3 text-base font-semibold shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal flex items-center space-x-2"
                            aria-label="Resolve Anomaly"
                          >
                            {updatingId === anomal._id ? (
                              <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Resolving...</span>
                              </>
                            ) : (
                              <span>Resolve</span>
                            )}
                          </button>
                          <button
                            onClick={() => handleUpdateAnomaly(anomal._id, "dismissed")}
                            disabled={updatingId === anomal._id}
                            className="bg-red-50 hover:bg-red-100 disabled:bg-red-25 text-red-600 border border-red-200 rounded-lg px-6 py-3 text-base font-medium shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 leading-normal"
                            aria-label="Dismiss Anomaly"
                          >
                            {updatingId === anomal._id ? 'Dismissing...' : 'Dismiss'}
                          </button>
                        </div>
                      )}
                      {anomal.status !== "pending" && (
                        <button
                          className="bg-gray-100 text-gray-500 rounded-lg px-6 py-3 text-base font-medium shadow cursor-not-allowed leading-normal"
                          disabled
                        >
                          {anomal.status.charAt(0).toUpperCase() + anomal.status.slice(1)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 leading-normal">
                  Page {page} of {totalPages} ({filteredAnomalies.length} results)
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    pageNumber = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors duration-200 ${
                        page === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminAnomalies;
