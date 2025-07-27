import React, { useEffect, useState } from "react";
import axios from "axios";
import ResetPasswordModal from "../components/ResetPasswordModal";

export default function ManageUsersPage() {
  const [tteStats, setTteStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   // For reset password modal
  const [modalOpen, setModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/getTTEAnalytics`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        console.log(res.data.tteStats)
        setTteStats(res.data.tteStats || []);
        
      } catch (err) {
        setError("Failed to load TTE analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleOpenResetModal = (tte) => {
    setActiveUser(tte);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setActiveUser(null);
    setModalOpen(false);
  };

  const handleResetSuccess = () => {
    //TODO: Optional: Show a toast/message or refetch users
  };

  return (
    <main role="main" className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">TTE Performance Analytics</h1>

      {error && <div className="text-red-700 mb-4" role="alert">{error}</div>}
      {loading ? (
        <div className="text-center py-8 text-blue-600">Loading analytics...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border rounded-lg shadow">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Zone</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Total Issued</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Paid</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Unpaid</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Recovery %</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {tteStats.map((tte) => (
                <tr key={tte.id}>
                  <td className="px-4 py-2 font-semibold">{tte.name}</td>
                  <td className="px-4 py-2">{tte.employeeId}</td>
                  <td className="px-4 py-2">{tte.zone}</td>
                  <td className="px-4 py-2 text-center">{tte.issued}</td>
                  <td className="px-4 py-2 text-center text-green-700 font-medium">{tte.paid}</td>
                  <td className="px-4 py-2 text-center text-red-700 font-medium">{tte.unpaid}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="inline-block px-2 py-1 bg-blue-100 rounded text-blue-700 font-semibold">{tte.recovery}%</div>
                  </td>
                  <td className="px-4 py-2 text-center text-xs text-slate-500">
                    {tte.lastLogin ? new Date(tte.lastLogin).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleOpenResetModal(tte)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded shadow font-semibold"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!tteStats.length && (
            <div className="text-center text-slate-400 py-8">No TTE data available.</div>
          )}
        </div>
      )}
      <ResetPasswordModal
        user={activeUser}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleResetSuccess}
      />
    </main>
  );
}
