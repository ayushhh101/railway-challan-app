import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TTEProfilePage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentChallans, setRecentChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tte/tteProfile`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setProfile(res.data.profile);
        setStats(res.data.stats);
        setRecentChallans(res.data.recentChallans);
      } catch (err) {
        setError("Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="pt-16 text-center text-lg">Loading your dashboard...</div>;
  if (error)
    return <div className="pt-16 text-center text-red-600" role="alert">{error}</div>;

  return (
    <main role="main" className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow">
      <section className="flex items-center gap-6 mb-8 bg-blue-50 rounded-lg p-6 shadow-inner">
        <div>
          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700 shadow">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-800">{profile.name}</h1>
          <div className="text-gray-600 text-sm">Employee ID: <b>{profile.employeeId}</b></div>
          <div className="text-gray-600 text-sm">Zone: {profile.zone}</div>
          <div className="text-gray-400 text-xs mt-1">Last Login: {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '—'}</div>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
        <div className="p-4 bg-blue-100 rounded text-center shadow">
          <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
          <div className="text-xs text-gray-700 font-semibold">Total Issued</div>
        </div>
        <div className="p-4 bg-green-100 rounded text-center shadow">
          <div className="text-2xl font-bold text-green-700">{stats.paid}</div>
          <div className="text-xs text-gray-700 font-semibold">Paid</div>
        </div>
        <div className="p-4 bg-red-100 rounded text-center shadow">
          <div className="text-2xl font-bold text-red-700">{stats.unpaid}</div>
          <div className="text-xs text-gray-700 font-semibold">Unpaid</div>
        </div>
        <div className="p-4 bg-yellow-100 rounded text-center shadow">
          <div className="text-2xl font-bold text-yellow-700">{stats.recovery}%</div>
          <div className="text-xs text-gray-700 font-semibold">Recovery Rate</div>
        </div>
      </section>

      {/* Recent Challans */}
      <section>
        <h2 className="text-lg font-semibold text-blue-800 mb-2 px-2 sm:px-0">
          Recent Challans Issued
        </h2>
        {recentChallans.length === 0 ? (
          <div className="text-slate-400 text-sm py-8 text-center px-2 sm:px-0">
            No challans found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded shadow bg-white text-sm table-fixed sm:table-auto">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-2 py-2 sm:px-3 sm:py-2 text-left font-semibold w-1/4">Passenger Name</th>
                  <th className="px-2 py-2 sm:px-3 sm:py-2 text-left font-semibold w-1/6">Aadhar Last 4</th>
                  <th className="px-2 py-2 sm:px-3 sm:py-2 text-left font-semibold w-1/4">Reason</th>
                  <th className="px-2 py-2 sm:px-3 sm:py-2 text-right font-semibold w-1/6">Fine (₹)</th>
                  <th className="px-2 py-2 sm:px-3 sm:py-2 text-center font-semibold w-1/12">Status</th>
                  <th className="px-2 py-2 sm:px-3 sm:py-2 text-right font-semibold w-1/6">Issued At</th>
                </tr>
              </thead>
              <tbody>
                {recentChallans.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-2 py-2 sm:px-3 sm:py-2 truncate">{c.passengerName}</td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2 text-left">****{c.passengerAadharLast4}</td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2 truncate">{c.reason}</td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2 text-right">{c.fineAmount}</td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2 text-center">
                      {c.paid ? (
                        <span className="inline-block px-2 rounded bg-green-100 text-green-800 text-xs">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-block px-2 rounded bg-red-100 text-red-700 text-xs">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2 text-right text-gray-500 whitespace-nowrap">
                      {new Date(c.issuedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </main>
  );
}
