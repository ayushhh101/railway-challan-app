import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CalendarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
  const itemsPerPage = 15;

  useEffect(() => {
    setLoading(true);
    const fetchAnomalies = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/anomalies`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAnomalies(res.data.anomalies);
      } catch (error) {
        console.error('Error fetching anomalies:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnomalies();
  }, [user]);

  //TODO: learn about use memo
  const { filteredAnomalies, totalPages, tabCounts } = useMemo(() => {
    const counts = { all: anomalies.length, pending: 0, resolved: 0, dismissed: 0 };
    
    for (let a of anomalies) {
      if (counts[a.status] !== undefined) counts[a.status]++;
    }

    const filtered = activeTab === 'all' ? anomalies : anomalies.filter(a => a.status === activeTab);

    console.log(filtered)
    return { 
      filteredAnomalies: filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage),
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      tabCounts: counts
    }
  }, [anomalies, activeTab, page]);

  const handleUpdateAnomaly = async (anomalyId, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/anomalies/${anomalyId}/${status}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
      });

      const updatedAnomalies = anomalies.map(anomaly =>
        anomaly._id === anomalyId ? { ...anomaly, status } : anomaly
      );
      setAnomalies(updatedAnomalies);
      setPage(1);
    }
    catch (error) {
      console.error('Error resolving anomaly:', error);
    }
  };

  if (loading) return <div>Loading anomalies...</div>;
  
  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-4">
      <h1 className="text-xl sm:text-2xl pt-3 font-bold text-[#1E40AF] mb-1">Anomaly Alerts</h1>
      <p className="text-[15px] text-[#64748B] mb-6">Monitor and manage system detected anomalies</p>

      <div className="flex text-sm sm:text-base gap-2 sm:gap-5 mb-6 border-b border-blue-400">
        {TABS.map(tab => (
          <button
            key={tab.value}
            className={`pb-2 px-4 ${activeTab === tab.value ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => {
              setActiveTab(tab.value);
              setPage(1);
            }}
          >
            {tab.label}
            <span className="ml-1 bg-slate-100 text-[#1E40AF] font-semibold rounded py-0.5 px-2 text-xs">
              {tabCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {filteredAnomalies.length === 0 ? (
        <p className="text-slate-400 text-center my-12 text-base">{activeTab === 'all' ? "No anomalies detected." : `No ${activeTab} anomalies.`}</p>
      ) : (
        <div className="space-y-4">
          {filteredAnomalies.map(anomal => (
            <div
              key={anomal._id}
              className="relative flex gap-4 bg-white rounded-xl shadow-sm border p-4 border-slate-200 items-start"
            >
              {/* Icon */}
              <div className="pt-2 pl-1">
                <span className="inline-flex items-center justify-center bg-red-100 border border-red-200 rounded-full w-10 h-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-700" />
                </span>
              </div>
              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center mb-1">
                  <div className="font-semibold text-base text-slate-800">{anomal.message}</div>
                  {/* Status */}
                  <div className="ml-2 flex items-center">
                    {anomal.status === "pending" && (
                      <span className="bg-yellow-50 text-yellow-800 text-xs font-semibold rounded px-3 py-1 ml-2 border border-yellow-100">Pending</span>
                    )}
                    {anomal.status === "resolved" && (
                      <span className="bg-green-50 text-green-800 text-xs font-semibold rounded px-3 py-1 ml-2 border border-green-100">Resolved</span>
                    )}
                    {anomal.status === "dismissed" && (
                      <span className="bg-slate-100 text-slate-700 text-xs font-semibold rounded px-3 py-1 ml-2 border">Dismissed</span>
                    )}
                  </div>
                </div>
                {/* Metadata line 1 */}
                <div className="flex flex-wrap gap-6 gap-y-1 text-[15px] text-slate-700 mb-0.5">
                  {anomal.user && anomal.user._id && <div><span className="text-sm text-slate-400 mr-1">Issued By</span><span className="text-sm font-normal">{anomal.user.name} ({anomal.user._id})</span></div>}
                </div>
                {/* Metadata line 2 */}
                <div className="flex flex-wrap items-center gap-8 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-4 text-gray-500" />
                    Created on {new Date(anomal.createdAt)
                      .toLocaleString('en-GB', {
                        day: "2-digit",
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                  </span>
                  {( anomal.challan._id) && (
                    <span>
                      Related Challan:{' '}
                      <a
                        href={`/challans/${anomal.challan._id}`}
                        className="text-[#1E40AF] underline font-medium"
                      >
                        {anomal.challan.code || anomal.challan._id}
                      </a>
                    </span>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              {anomal.status === "pending" && (
                <div className="flex flex-col gap-2 items-end ml-4">
                  <button
                    type="button"
                    className="bg-[#1E40AF] text-white rounded-md px-4 py-1 text-sm font-medium shadow hover:bg-blue-800 transition"
                    onClick={() => handleUpdateAnomaly(anomal._id, "resolved")}
                    aria-label="Resolve Anomaly"
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    className="bg-red-50 text-red-500 rounded-md px-4 py-1 text-sm font-medium border border-red-100 shadow hover:bg-red-100 transition"
                    onClick={() => handleUpdateAnomaly(anomal._id, "dismissed")}
                    aria-label="Dismiss Anomaly"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              {anomal.status === "resolved" && (
                <div className="flex flex-col gap-2 items-end ml-4">
                  <button
                    type="button"
                    className="bg-slate-100 text-slate-500 rounded-md px-4 py-1 text-sm font-medium border shadow cursor-not-allowed"
                    disabled
                  >
                    Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`w-8 h-8 rounded ${page === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminAnomalies