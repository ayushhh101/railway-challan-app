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
        setError(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Could not load your profile."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="pt-16 text-center text-lg">Loading your dashboard...</div>;
  if (error)
    return <div className="pt-16 text-center text-red-600" role="alert">{error}</div>;

  const fmtDate = (dt) =>
    dt ? new Date(dt).toLocaleDateString() : "—";

  return (
    <main className="max-w-6xl mx-auto py-8 px-2 sm:px-4 bg-white rounded-2xl shadow-xl">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-7 border-b pb-6 mb-8 bg-primary-light/10 rounded-xl shadow-inner px-4 pt-5">
        <div className="flex items-center gap-5">
          <div>
            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-3xl font-extrabold text-primary-blue shadow">
              {profile.profilePic
                ? <img src={profile.profilePic} alt="Profile Pic" className="w-full h-full object-cover rounded-full" />
                : profile.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary-dark flex items-center gap-2">
              {profile.name}
              <span className="ml-2 px-2 py-1 text-xs bg-primary-blue text-white rounded-full uppercase">Active</span>
            </div>
            <div className="text-gray-700 mb-1 font-medium">{profile.designation || "Traveling Ticket Examiner"}</div>
            <div className="text-slate-600 text-sm">Employee ID: <b>{profile.employeeId}</b></div>
          </div>
        </div>

        {/* mini details */}
        <div className="mt-5 sm:mt-0 flex flex-col gap-1 text-sm text-slate-700">
          <div>
            <span className="mr-2 font-medium">Email:</span>
            {profile.email || "—"}
          </div>
          <div>
            <span className="mr-2 font-medium">Phone:</span>
            {profile.phone || "—"}
          </div>
          <div>
            <span className="mr-2 font-medium">Zone:</span>
            {profile.zone || "—"}
          </div>
          <div>
            <span className="mr-2 font-medium">Current Station:</span>
            {profile.currentStation || "—"}
          </div>
        </div>
      </div>

      {/* details Grid */}
      <div className="grid sm:grid-cols-2 gap-x-10 mb-8 px-2">
        <div className="mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-gray-600 text-xs">Date of Joining</span>
            <span className="text-base font-medium text-primary-blue">{fmtDate(profile.dateOfJoining)}</span>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <span className="text-gray-600 text-xs">Reporting Officer</span>
            <span className="text-base">{profile.reportingOfficer || "—"}</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-gray-600 text-xs">Last Login</span>
            <span className="text-base">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : "—"}</span>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <span className="text-gray-600 text-xs">Division</span>
            <span className="text-base">{profile.division || "—"}</span>
          </div>
        </div>
      </div>

      {/* performance stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-primary-light/20 border border-primary-blue/50 rounded-lg p-5 text-center shadow">
          <div className="text-2xl font-bold text-blue-800">{stats?.total}</div>
          <div className="text-xs text-primary-dark font-semibold mt-1 uppercase tracking-wide">Challans Issued This Month</div>
        </div>
        <div className="bg-secondary-success-light/25 border border-secondary-success-green/50 rounded-lg p-5 text-center shadow">
          <div className="text-2xl font-bold text-green-700">₹{stats?.collected || 0}</div>
          <div className="text-xs text-green-900 font-semibold mt-1 uppercase tracking-wide">Total Fine Collected</div>
        </div>
        <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-5 text-center shadow">
          <div className="text-2xl font-bold text-accent-orange">{stats?.resolutionRate || 0}%</div>
          <div className="text-xs text-accent-orange font-semibold mt-1 uppercase tracking-wide">Resolution Rate</div>
        </div>
      </section>

      {/* Recent Challans Table */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-[#1E40AF] mb-3 pl-1">Recent Activity</h2>
        {recentChallans.length === 0 ? (
          <div className="text-slate-400 text-sm py-8 text-center px-2 sm:px-0">
            No challans found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded shadow bg-white text-sm table-fixed sm:table-auto">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-bold">Challan ID</th>
                  <th className="px-3 py-2 text-left font-bold">Date/Time</th>
                  <th className="px-3 py-2 text-left font-bold">Train</th>
                  <th className="px-3 py-2 text-left font-bold">Offense</th>
                  <th className="px-3 py-2 text-center font-bold">Amount</th>
                  <th className="px-3 py-2 text-center font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentChallans.map((c) => (
                  <tr key={c._id} className="hover:bg-blue-50">
                    <td className="px-3 py-2 font-mono text-xs">{c._id.slice(-6)}</td>
                    <td className="px-3 py-2">{new Date(c.issuedAt).toLocaleString()}</td>
                    <td className="px-3 py-2">{c.trainNumber}</td>
                    <td className="px-3 py-2">{c.reason}</td>
                    <td className="px-3 py-2 text-center">₹{c.fineAmount}</td>
                    <td className="px-3 py-2 text-center">
                      {c.paid ? (
                        <span className="w-full inline-block px-2 py-1 rounded bg-secondary-success-light/25 text-secondary-success-green text-xs font-semibold">Paid</span>
                      ) : (
                        <span className="w-full inline-block px-2 py-1 rounded bg-secondary-danger-light/25 text-secondary-danger-red text-xs font-semibold">Unpaid</span>
                      )}
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
