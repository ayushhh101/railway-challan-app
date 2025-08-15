import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminAudit = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setcurrentPage] = useState(1)
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
        //TODO: only fetch page-wise audits 
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
    <div className="p-3 sm:p-6 max-w-6xl mx-auto mt-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-6 text-[#1E40AF]">Audit Logs</h1>

      {/* Mobile: cards view. Desktop: table */}
      <div className="block sm:hidden">
        <div className="flex flex-col gap-3">
          {paginatedLogs.map((log) => (
            <div key={log._id} className="rounded-lg border shadow-sm bg-white p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-base font-semibold">{log.action}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === 'SUCCESS'
                  ? 'bg-green-100 text-green-700'
                  : log.status === 'FAILURE'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {log.status}
                </span>
              </div>
              <div className="text-xs text-gray-700">
                <b>User:</b> {log.performedBy?.name} ({log.performedBy?.employeeId})<br />
                <b>Role:</b> {log.role}<br />
                <b>Severity:</b> <span className={`font-medium ${log.severity === 'low' ? 'text-blue-700'
                  : log.severity === 'medium' ? 'text-yellow-700'
                    : log.severity === 'high' ? 'text-orange-700'
                      : 'text-red-700'
                  }`}>
                  {log.severity}
                </span>
                <br />
                <b>Date:</b> {new Date(log.createdAt).toLocaleString()}
                <br />
                <b>User Agent:</b> <span className="break-all">{log.userAgent || "-"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden sm:block overflow-x-auto border rounded-lg shadow-sm bg-white">
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
            {paginatedLogs.map((log) => (
              <tr key={log._id}>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{log.performedBy?.name} ({log.performedBy?.employeeId})</td>
                <td className="px-4 py-2 capitalize">{log.role}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === 'SUCCESS'
                    ? 'bg-green-100 text-green-700'
                    : log.status === 'FAILURE'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${log.severity === 'low' ? 'bg-blue-100 text-blue-700'
                    :
                    log.severity === 'medium' ? 'bg-yellow-100 text-yellow-700'
                      :
                      log.severity === 'high' ? 'bg-orange-100 text-orange-700'
                        :
                        'bg-red-100 text-red-700'
                    }`}>
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setcurrentPage(p => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === 1}
            aria-label="Previous Page"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setcurrentPage(p => Math.min(p + 1, totalPages))}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            aria-label="Next Page"
          >
            Next
          </button>
        </div>
      )}
    </div>

  );
}

export default AdminAudit