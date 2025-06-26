import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminAnomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
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
  }, [user, anomalies]);

  const { filteredAnomalies, totalPages } = useMemo(() => {
    const filtered = anomalies.filter(anomaly => activeTab === 'all' || anomaly.status === activeTab);

    return { 
      filteredAnomalies: filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage),
      totalPages: Math.ceil(filtered.length / itemsPerPage)
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
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#1E40AF] mb-6 text-center">Anomaly Alerts</h1>
      
      <div className="flex gap-4 mb-6 border-b border-blue-400">
        {['all', 'pending', 'resolved', 'dismissed'].map(tab => (
          <button
            key={tab}
            className={`pb-2 px-4 ${activeTab === tab ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {filteredAnomalies.length === 0 ? (
        <p>No {activeTab === 'all' ? '' : activeTab} anomalies detected.</p>
      ) : (
        <div className="space-y-4">
          {filteredAnomalies.map((anomal) => (
            <div key={anomal._id} className="border border-red-200 bg-red-50 p-3 rounded shadow-sm">
              <p className="font-medium text-red-800">{anomal.message}</p>
              <p className="text-xs text-gray-500">By: {anomal.user.name}</p>
              <p className="text-xs text-blue-600 underline">Related Challan: #{anomal.challan._id}</p>
              <p className="text-xs text-gray-500">Status: {anomal.status}</p>
              <p className="text-xs text-gray-500">Created At: {new Date(anomal.createdAt).toLocaleString()}</p>
              
              {anomal.status === 'pending' && (
                <div className="mt-3 flex justify-end space-x-2">
                  <button
                    type="submit"
                    className="bg-[#1E40AF] text-white py-1 px-3 rounded-md text-sm font-light hover:bg-blue-900 transition"
                    onClick={() => handleUpdateAnomaly(anomal._id, 'resolved')}
                  >
                    Resolve
                  </button>
                  <button
                    type="submit"
                    className="bg-red-800 text-white py-1 px-3 rounded-md text-sm font-light hover:bg-red-900 transition"
                    onClick={() => handleUpdateAnomaly(anomal._id, 'dismissed')}
                  >
                    Dismiss
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