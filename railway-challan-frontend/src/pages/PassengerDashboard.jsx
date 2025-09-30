import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  DocumentTextIcon,
  CurrencyRupeeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { TrainIcon } from 'lucide-react';

function getPassengerToken() {
  return localStorage.getItem("token");
}

export default function PassengerDashboard() {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchChallans();
  }, []);

  const fetchChallans = async (showToast = false) => {
    if (showToast) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError("");
    const toastId = showToast ? toast.loading('Refreshing challans...') : null;
    
    try {
      const token = getPassengerToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/passenger/mychallans`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChallans(res.data.data?.challans || []);
      if (showToast) {
        toast.success(`Loaded ${res.data.data?.challans?.length || 0} challans`, { id: toastId });
      }
    } catch (err) {
      console.error('Failed to load challans:', err);
      const errorMessage = err.response?.data?.message || "Failed to load challans from server.";
      setError(errorMessage);
      if (showToast) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDownloadPDF = async (challanId) => {
    setDownloading(challanId);
    const toastId = toast.loading("Preparing PDF download...");
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
      toast.success("PDF downloaded successfully!", { id: toastId });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Loading Dashboard...</p>
          <p className="text-sm text-slate-500 mt-1">Fetching your challan records</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center max-w-md mx-auto">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200/50 rounded-2xl p-8">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-3">Dashboard Error</h3>
            <p className="text-base text-red-700 mb-6">{error}</p>
            <button
              onClick={() => fetchChallans(false)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <DocumentTextIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-5xl font-black tracking-tight mb-2">
                  My Challans Dashboard
                </h1>
                <p className="text-lg text-blue-100 font-medium">
                  View and manage your railway violation records
                </p>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <button
                onClick={() => fetchChallans(true)}
                disabled={refreshing}
                className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 disabled:bg-white/5 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8">
        
        {/* Enhanced Statistics Cards */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Overview Statistics</h2>
                <p className="text-slate-600">Summary of your challan records and payments</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              
              {/* Total Challans */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-800 mb-2">
                  {stats.total}
                </div>
                <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  Total Challans
                </div>
              </div>

              {/* Paid Challans */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-800 mb-2">
                  {stats.paid}
                </div>
                <div className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                  Paid
                </div>
              </div>

              {/* Unpaid Challans */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <XCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-red-800 mb-2">
                  {stats.unpaid}
                </div>
                <div className="text-sm font-semibold text-red-600 uppercase tracking-wide">
                  Unpaid
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CurrencyRupeeIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-orange-800 mb-2">
                  ₹{stats.totalAmount.toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                  Total Amount
                </div>
              </div>

              {/* Pending Amount */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-purple-800 mb-2">
                  ₹{stats.pendingAmount.toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                  Pending Amount
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Challans List */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Challan Records</h2>
                <p className="text-slate-600">
                  {challans.length > 0 
                    ? `Showing all ${challans.length} challan records`
                    : 'No challans found in your account'
                  }
                </p>
              </div>
              {stats.unpaid > 0 && (
                <div className="mt-4 sm:mt-0">
                  <div className="bg-red-100 border border-red-200 rounded-xl px-4 py-2">
                    <span className="text-sm font-semibold text-red-800">
                      {stats.unpaid} Unpaid Challan{stats.unpaid > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {challans.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DocumentTextIcon className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Challans Found</h3>
              <p className="text-slate-500 mb-4">You currently have no challan records in your account</p>
              <p className="text-sm text-slate-400">Any future challans will appear here</p>
            </div>
          ) : (
            <div className="p-8 space-y-6">
              {challans.map((c) => (
                <div
                  key={c._id}
                  className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    
                    {/* Challan Details */}
                    <div className="flex-1 space-y-4">
                      
                      {/* Header with ID & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center space-x-2">
                            <DocumentTextIcon className="w-5 h-5 text-slate-600" />
                            <span>Challan #{c._id.slice(-8)}</span>
                          </h3>
                          <div className="flex items-center space-x-2">
                            <TrainIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600 font-medium">Train: {c.trainNumber}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 sm:mt-0">
                          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                            c.paid
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {c.paid ? (
                              <>
                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                Paid
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-4 h-4 mr-2" />
                                Unpaid
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reason</span>
                          <p className="text-sm font-semibold text-slate-900 mt-1">{c.reason}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fine Amount</span>
                          <div className="flex items-center space-x-1 mt-1">
                            <CurrencyRupeeIcon className="w-4 h-4 text-green-600" />
                            <p className="text-lg font-bold text-green-600">
                              {c.fineAmount?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Issued Date</span>
                          <div className="flex items-center space-x-1 mt-1">
                            <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">
                              {new Date(c.issuedAt || c.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        {c.coachNumber && (
                          <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Coach</span>
                            <p className="text-sm font-semibold text-slate-900 mt-1">{c.coachNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 min-w-0 sm:min-w-[200px]">
                      
                      {/* Download PDF Button */}
                      <button
                        onClick={() => handleDownloadPDF(c._id)}
                        disabled={downloading === c._id}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
                      >
                        {downloading === c._id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <DocumentArrowDownIcon className="w-5 h-5" />
                            <span>Download PDF</span>
                          </>
                        )}
                      </button>

                      {/* Pay Button (only for unpaid challans) */}
                      {!c.paid && (
                        <button
                          onClick={() => handlePayClick(c)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                        >
                          <CreditCardIcon className="w-5 h-5" />
                          <span>Pay ₹{c.fineAmount?.toLocaleString()}</span>
                        </button>
                      )}

                      {c.paid && (
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200 text-green-800 font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2">
                          <CheckCircleIcon className="w-5 h-5" />
                          <span>Payment Complete</span>
                        </div>
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