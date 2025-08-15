import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function getPassengerToken() {
  return localStorage.getItem("token");
}

export default function PassengerDashboard() {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallans = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getPassengerToken();
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/passenger/mychallans`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setChallans(res.data.challans || []);
      } catch (err) {
        setError("Failed to load challans");
        toast.error("Failed to load challans from server.");
      } finally {
        setLoading(false);
      }
    };
    fetchChallans();
  }, []);

  // Download PDF for challan
  const handleDownloadPDF = async (challanId) => {
    setDownloading(challanId);
    const toastId = toast.loading("Preparing PDF...");
    try {
      const token = getPassengerToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pdf/challan/${challanId}/pdf`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `challan-${challanId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started!", { id: toastId });
    } catch (err) {
      toast.error("Failed to download challan PDF.", { id: toastId });
    } finally {
      setDownloading(null);
    }
  };

  // Redirect to Verify page on "Pay" button click
  const handlePayClick = (challan) => {
    navigate(`/verify/${challan._id}`);
  };

  if (loading)
    return <div className="py-16 text-center text-lg">Loading your challans...</div>;
  if (error) return <div className="py-16 text-center text-red-600">{error}</div>;

  return (
    <main className="max-w-3xl mx-auto py-8 px-2 sm:px-6 bg-white rounded-xl shadow-lg min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">My Challans</h1>
      {challans.length === 0 ? (
        <div className="py-24 text-gray-500 text-center">No challans found for your account.</div>
      ) : (
        <div className="space-y-6">
          {challans.map((c) => (
            <div
              key={c._id}
              className="rounded-lg border shadow p-5 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <p>
                  <b>Challan ID:</b> {c._id}
                </p>
                <p>
                  <b>Train:</b> {c.trainNumber}
                </p>
                <p>
                  <b>Reason:</b> {c.reason}
                </p>
                <p>
                  <b>Fine Amount:</b> <span className="text-yellow-800 font-bold">₹{c.fineAmount}</span>
                </p>
                <p>
                  <b>Status:</b>{" "}
                  <span className={c.paid ? "text-green-600" : "text-red-600"}>{c.paid ? "Paid" : "Unpaid"}</span>
                </p>
                <p>
                  <b>Issued At:</b> {new Date(c.issuedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-3 min-w-[180px]">
                <button
                  onClick={() => handleDownloadPDF(c._id)}
                  disabled={downloading === c._id}
                  className="bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-800 transition"
                >
                  {downloading === c._id ? "Downloading..." : "Download PDF"}
                </button>
                {!c.paid && (
                  <button
                    onClick={() => handlePayClick(c)}
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-800 transition"
                  >
                    Pay ₹{c.fineAmount}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
