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
    fetchChallans();
  }, []);

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
      setChallans(res.data.data?.challans || []);
    } catch (err) {
      console.error('Failed to load challans:', err);
      const errorMessage = err.response?.data?.message || "Failed to load challans from server.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePayClick = (challan) => {
    navigate(`/verify/${challan._id}`);
  };

  const getStats = () => {
    const total = challans.length;
    const paid = challans.filter(c => c.paid).length;
    const unpaid = total - paid;
    const totalAmount = challans.reduce((sum, c) => sum + (c.fineAmount || 0), 0);
    const pendingAmount = challans.filter(c => !c.paid).reduce((sum, c) => sum + (c.fineAmount || 0), 0);
    
    return { total, paid, unpaid, totalAmount, pendingAmount };
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          {/* Body Text: 16px */}
          <p className="text-base text-gray-600 leading-normal">Loading your challans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2 leading-tight">
              Unable to Load Dashboard
            </h3>
            <p className="text-base text-red-700 leading-normal mb-4">{error}</p>
            <button
              onClick={fetchChallans}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 leading-normal"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div 
      className="min-h-screen bg-gray-50 px-4 py-6 lg:px-8 lg:py-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          {/* Page Title: Mobile 24-28px, Desktop 32-36px */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-blue-800 leading-tight mb-2">
                My Challans
              </h1>
              {/* Secondary Text: 14px */}
              <p className="text-sm text-gray-600 leading-normal">
                View and manage your railway challans
              </p>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchChallans}
              disabled={loading}
              className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal flex items-center space-x-2"
            >
              <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          
          {/* Total Challans */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-blue-800 leading-tight">
              {stats.total}
            </div>
            <div className="text-sm font-medium text-blue-600 mt-2 leading-normal">
              Total Challans
            </div>
          </div>

          {/* Paid Challans */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-green-800 leading-tight">
              {stats.paid}
            </div>
            <div className="text-sm font-medium text-green-600 mt-2 leading-normal">
              Paid
            </div>
          </div>

          {/* Unpaid Challans */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-red-800 leading-tight">
              {stats.unpaid}
            </div>
            <div className="text-sm font-medium text-red-600 mt-2 leading-normal">
              Unpaid
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-orange-800 leading-tight">
              ₹{stats.totalAmount.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-orange-600 mt-2 leading-normal">
              Total Amount
            </div>
          </div>

          {/* Pending Amount */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-purple-800 leading-tight">
              ₹{stats.pendingAmount.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-purple-600 mt-2 leading-normal">
              Pending Amount
            </div>
          </div>
        </div>

        {/* Challans List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
          <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 leading-tight">
            Challan Records
          </h2>

          {challans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              {/* Body Text: 16px */}
              <p className="text-base text-gray-500 leading-normal mb-2">
                No challans found
              </p>
              {/* Secondary Text: 14px */}
              <p className="text-sm text-gray-400 leading-normal">
                You currently have no challan records in your account
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {challans.map((c) => (
                <div
                  key={c._id}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    
                    {/* Challan Details */}
                    <div className="flex-1 space-y-3">
                      
                      {/* Challan ID & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          {/* Body Text: 16px */}
                          <h3 className="text-base font-semibold text-gray-900 leading-normal">
                            Challan #{c._id.slice(-8)}
                          </h3>
                          {/* Secondary Text: 14px */}
                          <p className="text-sm text-gray-600 leading-normal">
                            Train: {c.trainNumber}
                          </p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="mt-2 sm:mt-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold leading-normal ${
                            c.paid
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {c.paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>

                      {/* Challan Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 leading-normal">Reason:</span>
                          <p className="text-base text-gray-900 leading-normal">{c.reason}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 leading-normal">Fine Amount:</span>
                          <p className="text-lg font-bold text-orange-600 leading-normal">₹{c.fineAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 leading-normal">Issued Date:</span>
                          <p className="text-base text-gray-900 leading-normal">
                            {new Date(c.issuedAt || c.createdAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {c.coachNumber && (
                          <div>
                            <span className="text-sm font-medium text-gray-600 leading-normal">Coach:</span>
                            <p className="text-base text-gray-900 leading-normal">{c.coachNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 min-w-0 sm:min-w-[180px]">
                      {/* Download PDF Button */}
                      {/* Buttons/CTAs: 16px */}
                      <button
                        onClick={() => handleDownloadPDF(c._id)}
                        disabled={downloading === c._id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal flex items-center justify-center space-x-2"
                        aria-label="Download challan as PDF"
                      >
                        {downloading === c._id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download PDF</span>
                          </>
                        )}
                      </button>

                      {/* Pay Button (only for unpaid challans) */}
                      {!c.paid && (
                        <button
                          onClick={() => handlePayClick(c)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 leading-normal flex items-center justify-center space-x-2"
                          aria-label="Pay challan amount"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Pay ₹{c.fineAmount?.toLocaleString()}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
