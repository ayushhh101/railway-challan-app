import React, { useState, useEffect } from "react";
import axios from "axios";
import ChallanList from "../components/ChallanList";
import { useLocation } from "react-router-dom";
import toast from 'react-hot-toast';

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
      className="min-h-screen bg-gray-50 px-4 py-6 lg:px-8 lg:py-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-blue-800 leading-tight mb-2">
            Passenger History
          </h1>

          <p className="text-sm text-gray-600 leading-normal">
            Search and view detailed challan history for individual passengers
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">

          <h2 className="text-lg font-semibold text-gray-900 mb-6 leading-tight">
            Search Passenger Records
          </h2>
          
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              
              <div className="lg:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="name">
                  Passenger Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter passenger name"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
                  value={query.name}
                  onChange={(e) => setQuery((q) => ({ ...q, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="aadhar">
                  Aadhar Last 4 Digits
                </label>
                <input
                  id="aadhar"
                  type="text"
                  maxLength={4}
                  placeholder="Last 4 digits"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
                  value={query.aadhar}
                  onChange={(e) =>
                    setQuery((q) => ({ ...q, aadhar: e.target.value.replace(/\D/g, "") }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="dateFrom">
                  From Date
                </label>
                <input
                  id="dateFrom"
                  type="date"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
                  value={query.dateFrom}
                  onChange={(e) => setQuery((q) => ({ ...q, dateFrom: e.target.value }))}
                  max={query.dateTo || undefined}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="dateTo">
                  To Date
                </label>
                <input
                  id="dateTo"
                  type="date"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
                  value={query.dateTo}
                  onChange={(e) => setQuery((q) => ({ ...q, dateTo: e.target.value }))}
                  min={query.dateFrom || undefined}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal" htmlFor="paymentStatus">
                  Payment Status
                </label>
                <div className="relative">
                  <select
                    id="paymentStatus"
                    className="w-full appearance-none border border-gray-300 px-4 py-3 pr-10 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed bg-white"
                    value={query.paymentStatus}
                    onChange={(e) => setQuery((q) => ({ ...q, paymentStatus: e.target.value }))}
                  >
                    <option value="">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 flex flex-col sm:flex-row gap-3 sm:items-end">

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg px-6 py-3 text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal flex items-center justify-center space-x-2"
                  aria-label="Search Passenger Records"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Search</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg px-6 py-3 text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 leading-normal"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-base text-red-700 leading-normal">{error}</p>
            </div>
          )}
        </div>


        {passengerStats && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 leading-tight">
              Passenger Summary
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-blue-800 leading-tight">
                  {passengerStats.totalChallans}
                </div>
                <div className="text-sm font-medium text-blue-600 mt-2 leading-normal">
                  Total Challans
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6 border border-green-200 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-green-800 leading-tight">
                  {passengerStats.paidCount}
                </div>
                <div className="text-sm font-medium text-green-600 mt-2 leading-normal">
                  Paid
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-6 border border-red-200 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-red-800 leading-tight">
                  {passengerStats.unpaidCount}
                </div>
                <div className="text-sm font-medium text-red-600 mt-2 leading-normal">
                  Unpaid
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-6 border border-orange-200 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-orange-800 leading-tight">
                  ₹{passengerStats.totalFine?.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-orange-600 mt-2 leading-normal">
                  Total Fine Amount
                </div>
              </div>
            </div>
          </div>
        )}

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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-base text-gray-500 leading-normal mb-2">
                No challan records found
              </p>
              <p className="text-sm text-gray-400 leading-normal">
                Enter passenger details above to search for challan history
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
