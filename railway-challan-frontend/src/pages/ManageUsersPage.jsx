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
    <div className="max-w-7xl mx-auto  p-2 sm:p-6 bg-white rounded-lg shadow-lg mt-2 sm:mt-4 font-sans">
      <h1 className="text-xl sm:text-2xl font-bold text-primary-blue mb-2 sm:mb-3">TTE Performance Analytics</h1>
      <p className="text-xs sm:text-sm text-neutral-gray500 mb-4 sm:mb-6 -mt-1">
        Track and monitor ticket examiner performance metrics
      </p>
      {error && <div className="text-secondary-danger-red mb-4 text-sm" role="alert">{error}</div>}

      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white mb-4 shadow border border-neutral-gray200">
        <input
          type="text"
          placeholder="Search by name or ID"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 w-full sm:w-64 border border-neutral-gray300 px-3 py-2 rounded-2xl text-sm bg-neutral-gray50 focus:ring-2 focus:ring-primary-blue focus:outline-none"
        />
        <input
          type="date"
          value={dateRange.from}
          onChange={e => { setDateRange(dr => ({ ...dr, from: e.target.value })); setPage(1); }}
          className="flex-1 border border-neutral-gray300 rounded-2xl px-2 py-2 text-sm bg-neutral-gray50 focus:ring-2 focus:ring-primary-blue"
          max={dateRange.to || undefined}
        />
        <input
          type="date"
          value={dateRange.to}
          onChange={e => { setDateRange(dr => ({ ...dr, to: e.target.value })); setPage(1); }}
          className="flex-1 border border-neutral-gray300 rounded-2xl px-2 py-2 text-sm bg-neutral-gray50 focus:ring-2 focus:ring-primary-blue"
          min={dateRange.from || undefined}
        />
        <select
          value={zone}
          onChange={e => { setZone(e.target.value); setPage(1); }}
          className="border border-neutral-gray300 rounded-2xl px-3 py-2 text-sm bg-neutral-gray50 focus:ring-2 focus:ring-primary-blue"
        >
          <option value="All Zones">All Zones</option>
          {ZONES.map(z => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
        <button
          onClick={() => { setSearch(""); setZone("All Zones"); setDateRange({ from: "", to: "" }); setPage(1); }}
          className="w-full sm:w-auto bg-neutral-gray200 hover:bg-neutral-gray300 text-neutral-gray900 px-4 py-2 rounded-2xl text-sm font-medium border border-neutral-gray300">
          Reset Filters
        </button>
      </div>



      {loading ? (
        <div className="text-center py-8 text-primary-blue text-base">Loading analytics...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-gray200 border rounded-2xl shadow text-xs sm:text-sm">
            <thead className="bg-neutral-gray50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-primary-blue uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-primary-blue uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-primary-blue uppercase tracking-wider">Zone</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-primary-blue uppercase tracking-wider">Total Issued</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-primary-blue uppercase tracking-wider">Paid</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-primary-blue uppercase tracking-wider">Unpaid</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-primary-blue uppercase tracking-wider">Recovery %</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-primary-blue uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-primary-blue uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-gray100">
              {paginatedStats.map((tte) => (
                <tr key={tte.id}>
                  <td className="px-4 py-2 font-semibold">{tte.name}</td>
                  <td className="px-4 py-2">{tte.employeeId}</td>
                  <td className="px-4 py-2">{tte.zone}</td>
                  <td className="px-4 py-2 text-center">{tte.issued}</td>
                  <td className="px-4 py-2 text-center text-secondary-success-green font-medium">{tte.paid}</td>
                  <td className="px-4 py-2 text-center text-secondary-danger-red font-medium">{tte.unpaid}</td>
                  <td className="px-4 py-2 text-center">
                  <div className="inline-block px-2 py-1 bg-blue-100 rounded text-primary-blue font-semibold">{tte.recovery}%</div>
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-slate-500 text-wrap">
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
                      className="bg-primary-blue hover:bg-primary-dark text-white text-xs px-3 py-1 rounded-2xl shadow font-semibold transition"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !filteredStats.length && (
            <div className="text-center text-neutral-gray300 py-8">No TTE data available.</div>
          )}
        </div>
      )}

        {!loading && totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-1.5 mt-5">
          {Array(totalPages).fill(0).map((_, idx) => (
            <button
              key={idx+1}
              className={`w-8 h-8 rounded-2xl ${page === idx + 1 ? "bg-primary-blue text-white font-bold shadow" : "bg-white border border-neutral-gray300 text-primary-blue"} hover:bg-primary-light hover:text-white`}
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
