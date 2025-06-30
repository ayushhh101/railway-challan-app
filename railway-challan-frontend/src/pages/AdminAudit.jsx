import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminAudit = ()=> {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="text-center mt-6">Loading audit logs...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-[#1E40AF]">Audit Logs</h1>

      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Action</th>
              <th className="px-4 py-2 text-left font-semibold">User</th>
              <th className="px-4 py-2 text-left font-semibold">Role</th>
              <th className="px-4 py-2 text-left font-semibold">Status</th>
              <th className="px-4 py-2 text-left font-semibold">Severity</th>
              <th className="px-4 py-2 text-left font-semibold">User Agent</th>
              <th className="px-4 py-2 text-left font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log._id}>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{log.performedBy?.name} ({log.performedBy?.employeeId})</td>
                <td className="px-4 py-2 capitalize">{log.role}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      log.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-700'
                        : log.status === 'FAILURE'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      log.severity === 'low'
                        ? 'bg-blue-100 text-blue-700'
                        : log.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : log.severity === 'high'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {log.severity}
                  </span>
                </td>
                <td className="px-4 py-2 truncate max-w-xs">{log.userAgent}</td>
                <td className="px-4 py-2">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAudit