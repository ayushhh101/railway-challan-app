import React, { useState, useEffect } from "react";
import axios from "axios";
import ChallanList from "../components/ChallanList";
import { useLocation } from "react-router-dom";
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function PassengerHistoryPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState({
    name: params.get("name") || "",
    aadhar: params.get("aadharLast4") || "",
    dateFrom: "",
    dateTo: "",
    paymentStatus: "",
  });

  const [passengerStats, setPassengerStats] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChallans, setSelectedChallans] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedChallans = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(results.length / itemsPerPage);

  const toggleChallanSelection = (id) => {
    setSelectedChallans((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allSelected = results.every((challan) =>
      selectedChallans.includes(challan._id)
    );
    setSelectedChallans(allSelected ? [] : results.map((c) => c._id));
  };

  const handleAdminDownload = async (challanId) => {
    const toastId = toast.loading("Preparing PDF...");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pdf/challan/${challanId}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `challan-${challanId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started!", { id: toastId });
    } catch (err) {
      console.error("Admin Download error:", err);
      toast.error("Could not download PDF. Try again.", { id: toastId });
    }
  };

  const handleSearch = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let searchParams = [];
      if (query.name.trim())
        searchParams.push(`name=${encodeURIComponent(query.name.trim())}`);
      if (query.aadhar.trim())
        searchParams.push(`aadharLast4=${encodeURIComponent(query.aadhar.trim())}`);
      if (query.dateFrom) searchParams.push(`dateFrom=${query.dateFrom}`);
      if (query.dateTo) searchParams.push(`dateTo=${query.dateTo}`);
      if (query.paymentStatus) searchParams.push(`paymentStatus=${query.paymentStatus}`);

      const url = `${import.meta.env.VITE_API_URL}/api/challan/passenger-history?${searchParams.join("&")}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setResults(res.data.challans || []);
      setPassengerStats(res.data.stats || null);
      setCurrentPage(1);
      setSelectedChallans([]);
      
      if (res.data.challans?.length > 0) {
        toast.success(`Found ${res.data.challans.length} challan records`);
      } else {
        toast.info("No challan records found for the search criteria");
      }
    } catch (error) {
      setResults([]);
      setPassengerStats(null);
      const errorMessage = error.response?.data?.message || "There was an error fetching challan history. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.name || query.aadhar) {
      handleSearch({ preventDefault: () => {} });
    }
  }, []);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [results, currentPage, totalPages]);

  const clearSearch = () => {
    setQuery({
      name: "",
      aadhar: "",
      dateFrom: "",
      dateTo: "",
      paymentStatus: "",
    });
    setResults([]);
    setPassengerStats(null);
    setSelectedChallans([]);
    setCurrentPage(1);
    setError(null);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <DocumentMagnifyingGlassIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-3xl font-black mb-2">
                Passenger History Search
              </h1>
              <p className="text-lg text-blue-100 font-normal">
                Comprehensive challan history lookup and detailed passenger analytics
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8">
        
        {/* Enhanced Search Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MagnifyingGlassIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Search Passenger Records
                </h2>
                <p className="text-slate-600">
                  Enter passenger details to retrieve complete challan history
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSearch} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                
                <div className="lg:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="name">
                    Passenger Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter full passenger name"
                      className="w-full border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white focus:ring-0 transition-all duration-200 outline-none text-base placeholder:text-slate-400"
                      value={query.name}
                      onChange={(e) => setQuery((q) => ({ ...q, name: e.target.value }))}
                    />
                    {query.name && (
                      <button
                        type="button"
                        onClick={() => setQuery(q => ({ ...q, name: '' }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="aadhar">
                    Aadhar Last 4 Digits
                  </label>
                  <input
                    id="aadhar"
                    type="text"
                    maxLength={4}
                    placeholder="Last 4 digits"
                    className="w-full border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white focus:ring-0 transition-all duration-200 outline-none text-base placeholder:text-slate-400"
                    value={query.aadhar}
                    onChange={(e) =>
                      setQuery((q) => ({ ...q, aadhar: e.target.value.replace(/\D/g, "") }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="dateFrom">
                    From Date
                  </label>
                  <input
                    id="dateFrom"
                    type="date"
                    className="w-full border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white focus:ring-0 transition-all duration-200 outline-none text-base"
                    value={query.dateFrom}
                    onChange={(e) => setQuery((q) => ({ ...q, dateFrom: e.target.value }))}
                    max={query.dateTo || undefined}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="dateTo">
                    To Date
                  </label>
                  <input
                    id="dateTo"
                    type="date"
                    className="w-full border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white focus:ring-0 transition-all duration-200 outline-none text-base"
                    value={query.dateTo}
                    onChange={(e) => setQuery((q) => ({ ...q, dateTo: e.target.value }))}
                    min={query.dateFrom || undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="paymentStatus">
                    Payment Status
                  </label>
                  <div className="relative">
                    <select
                      id="paymentStatus"
                      className="w-full appearance-none border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 pr-12 bg-white focus:ring-0 transition-all duration-200 outline-none text-base"
                      value={query.paymentStatus}
                      onChange={(e) => setQuery((q) => ({ ...q, paymentStatus: e.target.value }))}
                    >
                      <option value="">All Status</option>
                      <option value="paid">✅ Paid</option>
                      <option value="unpaid">❌ Unpaid</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 flex flex-col sm:flex-row gap-4 sm:items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold rounded-xl px-8 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
                    aria-label="Search Passenger Records"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <MagnifyingGlassIcon className="h-5 w-5" />
                        <span>Search Records</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={clearSearch}
                    className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold rounded-xl px-6 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200/50 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ExclamationCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-red-800 mb-2">Search Error</h4>
                    <p className="text-base text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Passenger Summary */}
        {passengerStats && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    Passenger Analytics Summary
                  </h2>
                  <p className="text-slate-600">
                    Complete overview of passenger's challan history and payment patterns
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black text-blue-800 mb-2">
                        {passengerStats.totalChallans}
                      </div>
                      <div className="text-sm font-semibold text-blue-600">
                        Total Challans
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black text-green-800 mb-2">
                        {passengerStats.paidCount}
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        Paid Challans
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 border border-red-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black text-red-800 mb-2">
                        {passengerStats.unpaidCount}
                      </div>
                      <div className="text-sm font-semibold text-red-600">
                        Unpaid Challans
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-6 border border-orange-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black text-orange-800 mb-2">
                        ₹{passengerStats.totalFine?.toLocaleString()}
                      </div>
                      <div className="text-sm font-semibold text-orange-600">
                        Total Fine Amount
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 ? (
          <ChallanList
            filteredChallans={results}
            selectedChallans={selectedChallans}
            viewType="table"
            paginatedChallans={paginatedChallans}
            totalPages={totalPages}
            currentPage={currentPage}
            handleAdminDownload={handleAdminDownload}
            toggleSelectAll={toggleSelectAll}
            toggleChallanSelection={toggleChallanSelection}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        ) : (
          !loading && !error && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <InformationCircleIcon className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-3">
                No Records Found
              </h3>
              <p className="text-base text-slate-500 mb-2 max-w-md mx-auto">
                No challan records match your search criteria. Try adjusting the search parameters or check the passenger details.
              </p>
              <p className="text-sm text-slate-400">
                Enter passenger details above to search for challan history
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}