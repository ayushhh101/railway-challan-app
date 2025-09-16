import React, { useState, useEffect } from "react";
import axios from "axios";
import ChallanList from "../components/ChallanList";
import { useLocation } from "react-router-dom";

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
  const itemsPerPage = 6;
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
    } catch (err) {
      console.error("Admin Download error:", err);
      alert("Download failed");
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

      const url = `${import.meta.env.VITE_API_URL}/api/challan/passenger-history?${searchParams.join(
        "&"
      )}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setResults(res.data.challans || []);
      setPassengerStats(res.data.stats || null);
      setCurrentPage(1);
      setSelectedChallans([]);
    } catch (error) {
      setResults([]);
      setPassengerStats(null);
      setError("There was an error fetching challan history. Please try again.");
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.name || query.aadhar) {
      handleSearch({ preventDefault: () => { } });
    }
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [results, currentPage, totalPages]);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-8 bg-white rounded-2xl shadow-lg mt-3 sm:mt-6 font-sans">
      <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-primary-blue border-b pb-2 sm:pb-3">Passenger Challan History</h2>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8 items-end">
        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-xs sm:text-sm font-semibold mb-1" htmlFor="name">
            Passenger Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Passenger Name"
            className="border border-neutral-gray300 rounded-2xl px-3 py-2 text-sm w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            value={query.name}
            onChange={(e) => setQuery((q) => ({ ...q, name: e.target.value }))}
          />
        </div>

        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-xs sm:text-sm font-semibold mb-1" htmlFor="aadhar">
            Aadhar Last 4
          </label>
          <input
            id="aadhar"
            type="text"
            maxLength={4}
            placeholder="Aadhar Last 4"
            className="border border-neutral-gray300 rounded-2xl px-3 py-2 text-sm w-full sm:w-36 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            value={query.aadhar}
            onChange={(e) =>
              setQuery((q) => ({ ...q, aadhar: e.target.value.replace(/\D/, "") }))
            }
          />
        </div>

        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-xs sm:text-sm font-semibold mb-1" htmlFor="dateFrom">
            From Date
          </label>
          <input
            id="dateFrom"
            type="date"
            className="border border-neutral-gray300 rounded-2xl px-3 py-2 text-sm w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            value={query.dateFrom}
            onChange={(e) => setQuery((q) => ({ ...q, dateFrom: e.target.value }))}
            max={query.dateTo || undefined}
          />
        </div>

        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-sm font-semibold mb-1" htmlFor="dateTo">
            To Date
          </label>
          <input
            id="dateTo"
            type="date"
            className="border border-neutral-gray300 rounded-2xl px-3 py-2 text-sm w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            value={query.dateTo}
            onChange={(e) => setQuery((q) => ({ ...q, dateTo: e.target.value }))}
            min={query.dateFrom || undefined}
          />
        </div>

        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-xs sm:text-sm font-semibold mb-1" htmlFor="paymentStatus">
            Payment Status
          </label>
          <select
            id="paymentStatus"
            className="border border-neutral-gray300 rounded-2xl px-3 py-2 text-sm w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            value={query.paymentStatus}
            onChange={(e) => setQuery((q) => ({ ...q, paymentStatus: e.target.value }))}
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-fit bg-primary-blue hover:bg-primary-dark disabled:bg-primary-light disabled:cursor-not-allowed text-white font-semibold rounded-2xl px-6 py-2 transition mt-2 sm:mt-0"
          aria-label="Search Passenger"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {passengerStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="p-3 sm:p-4 bg-primary-light/25 rounded-2xl shadow text-center">
            <p className="text-lg sm:text-xl font-semibold text-primary-blue">{passengerStats.totalChallans}</p>
            <p className="text-neutral-gray700 text-xs sm:text-sm mt-1">Total Challans</p>
          </div>
          <div className="p-3 sm:p-4 bg-secondary-success-light/30 rounded-2xl shadow text-center">
            <p className="text-lg sm:text-xl font-semibold text-secondary-success-green">{passengerStats.paidCount}</p>
            <p className="text-neutral-gray700 text-xs sm:text-sm mt-1">Paid</p>
          </div>
          <div className="p-3 sm:p-4 bg-secondary-danger-light/25 rounded-2xl shadow text-center">
            <p className="text-lg sm:text-xl font-semibold text-secondary-danger-red">{passengerStats.unpaidCount}</p>
            <p className="text-neutral-gray700 text-xs sm:text-sm mt-1">Unpaid</p>
          </div>
          <div className="p-3 sm:p-4 bg-accent-light/30 rounded-2xl shadow text-center">
            <p className="text-lg sm:text-xl font-semibold text-accent-orange">₹{passengerStats.totalFine.toLocaleString()}</p>
            <p className="text-neutral-gray700 text-xs sm:text-sm mt-1">Total Fine Amount</p>
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
        />
      ) : (
        !loading && (
          <div className="text-center text-gray-500 text-sm mt-12 italic">
            No challan records found.
          </div>
        )
      )}
    </div>
  );
}
