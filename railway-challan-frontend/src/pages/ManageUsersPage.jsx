import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ResetPasswordModal from "../components/ResetPasswordModal";

const ZONES = ["Central", "Western", "Harbour", "Trans-Harbour"];
const ITEMS_PER_PAGE = 7;

export default function ManageUsersPage() {
  const [tteStats, setTteStats] = useState([]);
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("All Zones");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);

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

  const filteredStats = useMemo(() => {
    let stats = [...tteStats];
    if (search.trim()) {
      stats = stats.filter(
        tte =>
          (tte.name && tte.name.toLowerCase().includes(search.toLowerCase())) ||
          (tte.employeeId && tte.employeeId.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (zone !== "All Zones") {
      stats = stats.filter(tte => tte.zone === zone);
    }
    if (dateRange.from || dateRange.to) {
      stats = stats.filter(tte => {
        const login = tte.lastLogin ? new Date(tte.lastLogin) : null;
        const afterFrom = dateRange.from ? login >= new Date(dateRange.from) : true;
        const beforeTo = dateRange.to ? login <= new Date(dateRange.to + "T23:59:59") : true;
        return login && afterFrom && beforeTo;
      });
    }
    return stats;
  }, [tteStats, search, zone, dateRange]);

  const totalPages = Math.ceil(filteredStats.length / ITEMS_PER_PAGE);
  const paginatedStats = filteredStats.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-4">
      <h1 className="text-2xl font-bold text-blue-800 mb-3">TTE Performance Analytics</h1>
      <p className="text-sm text-[#64748B] mb-6 -mt-2">
        Track and monitor ticket examiner performance metrics
      </p>
      {error && <div className="text-red-700 mb-4" role="alert">{error}</div>}

      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-4 rounded-lg bg-white mb-4 shadow border">
        <input
          type="text"
          placeholder="Search by name or ID"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-64 border px-3 py-2 rounded text-sm"
        />
        <input
          type="date"
          value={dateRange.from}
          onChange={e => { setDateRange(dr => ({ ...dr, from: e.target.value })); setPage(1); }}
          className="border rounded px-2 py-2 text-sm"
          max={dateRange.to || undefined}
        />
        <input
          type="date"
          value={dateRange.to}
          onChange={e => { setDateRange(dr => ({ ...dr, to: e.target.value })); setPage(1); }}
          className="border rounded px-2 py-2 text-sm"
          min={dateRange.from || undefined}
        />
        <select
          value={zone}
          onChange={e => { setZone(e.target.value); setPage(1); }}
          className="border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="All Zones">All Zones</option>
          {ZONES.map(z => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
        <button
          onClick={() => { setSearch(""); setZone("All Zones"); setDateRange({ from: "", to: "" }); setPage(1); }}
          className="ml-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm border border-gray-200"
        >
          Reset Filters
        </button>
      </div>



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
              {paginatedStats.map((tte) => (
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
                  <td className="px-4 py-2 text-center text-xs text-slate-500 text-wrap">
                    {tte.lastLogin ? (
                      <span>
                        {new Date(tte.lastLogin).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                    ) : (
                      "—"
                    )}
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
          {!loading && !filteredStats.length && (
            <div className="text-center text-slate-400 py-8">No TTE data available.</div>
          )}
        </div>
      )}

        {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-5">
          {Array(totalPages).fill(0).map((_, idx) => (
            <button
              key={idx+1}
              className={`w-8 h-8 rounded ${page === idx+1 ? "bg-blue-600 text-white font-bold shadow" : "bg-white border"} hover:bg-blue-100`}
              onClick={() => setPage(idx+1)}
            >
              {idx+1}
            </button>
          ))}
        </div>
      )}

      <ResetPasswordModal
        user={activeUser}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleResetSuccess}
      />
    </div>
  );
}
