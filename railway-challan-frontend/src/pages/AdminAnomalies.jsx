import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon, 
  XMarkIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';

const TABS = [
  { label: 'All', value: 'all', icon: MagnifyingGlassIcon, color: 'slate' },
  { label: 'Pending', value: 'pending', icon: ExclamationTriangleIcon, color: 'yellow' },
  { label: 'Resolved', value: 'resolved', icon: ShieldCheckIcon, color: 'green' },
  { label: 'Dismissed', value: 'dismissed', icon: XMarkIcon, color: 'gray' }
];

//TODO:change stuff here boxes here
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
    if (updatingId === anomalyId) return;

    setUpdatingId(anomalyId);
    const toastId = toast.loading(`Updating anomaly to ${newStatus}...`);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/anomalies/${anomalyId}/${newStatus}`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const updatedAnomalies = anomalies.map(anomaly =>
        anomaly._id === anomalyId ? { ...anomaly, status: newStatus } : anomaly
      );
      setAnomalies(updatedAnomalies);
      
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

  const handleRetry = () => {
    fetchAnomalies();
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Loading Security Anomalies</h3>
          <p className="text-base text-slate-600">Scanning for suspicious activities...</p>
        </div>
      </div>
    );
  }

  if (error && anomalies.length === 0) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-red-200/50 p-8">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-2">
              Failed to Load Security Data
            </h3>
            <p className="text-base text-red-700 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl font-bold transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-pink-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black mb-3">
                Security Anomaly Center
              </h1>
              <p className="text-lg text-red-100 font-medium max-w-2xl">
                Monitor, investigate, and resolve system-detected anomalies and suspicious activities
              </p>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={fetchAnomalies}
                    disabled={loading}
                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center space-x-2 border border-white/20"
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh Data</span>
                  </button>
                  <div className="text-center">
                    <p className="text-red-100 text-sm font-medium">System Status</p>
                    <div className="flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-white font-semibold text-sm">Monitoring Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8">

        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-red-50 px-8 py-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Anomaly Classification
            </h2>
            <p className="text-slate-600">
              Filter and manage anomalies by their current status and priority level
            </p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl'
                        : 'bg-gradient-to-br from-white to-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg'
                    }`}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setPage(1);
                    }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon className="w-5 h-5" />
                          <span className="font-semibold">{tab.label}</span>
                        </div>
                        <div className={`text-2xl font-black ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {tabCounts[tab.value]}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Anomalies List */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-red-50 px-8 py-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {activeTab === 'all' ? 'All Security Anomalies' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Anomalies`}
            </h2>
            <p className="text-slate-600">
              Detailed view of system-detected anomalies requiring administrative attention
            </p>
          </div>

          <div className="p-8">
            {filteredAnomalies.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ExclamationTriangleIcon className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {activeTab === 'all' ? "No Security Anomalies Detected" : `No ${activeTab} Anomalies Found`}
                </h3>
                <p className="text-base text-slate-500 mb-4">
                  {activeTab === 'pending' 
                    ? "All anomalies have been reviewed. Great job keeping the system secure!"
                    : "The security monitoring system will display anomalies here when they are detected"
                  }
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>System monitoring active</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAnomalies.map(anomal => (
                  <div
                    key={anomal._id}
                    className="relative bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-slate-300/50"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                      
                      {/* Enhanced Anomaly Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                          anomal.status === 'pending' 
                            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                            : anomal.status === 'resolved'
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                            : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                        }`}>
                          <ExclamationTriangleIcon className="h-8 w-8" />
                        </div>
                      </div>

                      {/* Enhanced Anomaly Details */}
                      <div className="flex-1 min-w-0">
                        
                        {/* Message and Status */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
                              Security Alert: {anomal.message}
                            </h3>
                          </div>
                          
                          {/* Enhanced Status Badge */}
                          <div className="mt-2 lg:mt-0 lg:ml-6">
                            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                              anomal.status === "pending" 
                                ? 'bg-yellow-400 text-white'
                                : anomal.status === "resolved"
                                ? 'bg-green-400  text-white'
                                : 'bg-gray-400  text-white'
                            }`}>
                              {anomal.status.charAt(0).toUpperCase() + anomal.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Enhanced Metadata */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-6">
                          {anomal.user && (anomal.user._id || anomal.user.name) && (
                            <div className="flex flex-wrap items-center">
                              <span className="text-sm font-semibold text-slate-600 mr-3">
                                Reported By:
                              </span>
                              <span className="text-base font-medium text-slate-900">
                                {anomal.user.name || 'Unknown User'} 
                                {anomal.user._id && anomal.user._id !== anomal.user.name && (
                                  <span className="text-slate-500 ml-2">({anomal.user._id})</span>
                                )}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-2 sm:space-y-0">
                            {/* Enhanced Created Date */}
                            <div className="flex items-center">
                              <CalendarIcon className="h-5 w-5 text-slate-400 mr-2" />
                              <span className="text-sm font-medium text-slate-600">
                                Detected: {new Date(anomal.createdAt).toLocaleString('en-GB', {
                                  day: "2-digit",
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            {/* Enhanced Related Challan */}
                            {anomal.challan?._id && (
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-slate-600 mr-2">
                                  Related Case:
                                </span>
                                <a
                                  href={`/challans/${anomal.challan._id}`}
                                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline decoration-2 underline-offset-2 transition-colors duration-200"
                                >
                                  #{anomal.challan.code || anomal.challan._id.slice(-8).toUpperCase()}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex-shrink-0">
                        {anomal.status === "pending" && (
                          <div className="flex flex-col gap-3">
                            <button
                              onClick={() => handleUpdateAnomaly(anomal._id, "resolved")}
                              disabled={updatingId === anomal._id}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white rounded-xl px-8 py-4 text-base font-bold shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2 min-w-[140px]"
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
                                <>
                                  <ShieldCheckIcon className="h-5 w-5" />
                                  <span>Resolve</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleUpdateAnomaly(anomal._id, "dismissed")}
                              disabled={updatingId === anomal._id}
                              className="bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 disabled:from-red-25 disabled:to-red-50 text-red-600 border-2 border-red-200 rounded-xl px-8 py-4 text-base font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2 min-w-[140px]"
                              aria-label="Dismiss Anomaly"
                            >
                              {updatingId === anomal._id ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Dismissing...</span>
                                </>
                              ) : (
                                <>
                                  <XMarkIcon className="h-5 w-5" />
                                  <span>Dismiss</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        {anomal.status !== "pending" && (
                          <div className="bg-slate-100 text-slate-500 rounded-xl px-8 py-4 text-base font-bold shadow cursor-not-allowed min-w-[140px] text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {anomal.status === 'resolved' ? (
                                <ShieldCheckIcon className="h-5 w-5" />
                              ) : (
                                <XMarkIcon className="h-5 w-5" />
                              )}
                              <span>{anomal.status.charAt(0).toUpperCase() + anomal.status.slice(1)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-12 pt-8 border-t border-slate-200 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-600">
                    Page {page} of {totalPages} • {filteredAnomalies.length} results
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-lg"
                  >
                    Previous
                  </button>

                  <div className="flex space-x-1">
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
                          className={`w-12 h-12 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
                            page === pageNumber
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                              : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 hover:shadow-lg'
                          }`}
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-lg"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnomalies;