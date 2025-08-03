import React, { useState, useEffect } from "react";
import axios from "axios";
import ChallanList from "../components/ChallanList";
import { useLocation } from "react-router-dom";

export default function PassengerHistoryPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

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
      console.error("Search failed:", error);
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
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [results, currentPage, totalPages]);

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-800 border-b pb-3">
        Passenger Challan History
      </h2>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-8 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1" htmlFor="name">
            Passenger Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Passenger Name"
            className="border border-gray-300 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query.name}
            onChange={(e) => setQuery((q) => ({ ...q, name: e.target.value }))}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1" htmlFor="aadhar">
            Aadhar Last 4
          </label>
          <input
            id="aadhar"
            type="text"
            maxLength={4}
            placeholder="Aadhar Last 4"
            className="border border-gray-300 rounded px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query.aadhar}
            onChange={(e) =>
              setQuery((q) => ({ ...q, aadhar: e.target.value.replace(/\D/, "") }))
            }
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1" htmlFor="dateFrom">
            From Date
          </label>
          <input
            id="dateFrom"
            type="date"
            className="border border-gray-300 rounded px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query.dateFrom}
            onChange={(e) => setQuery((q) => ({ ...q, dateFrom: e.target.value }))}
            max={query.dateTo || undefined}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1" htmlFor="dateTo">
            To Date
          </label>
          <input
            id="dateTo"
            type="date"
            className="border border-gray-300 rounded px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query.dateTo}
            onChange={(e) => setQuery((q) => ({ ...q, dateTo: e.target.value }))}
            min={query.dateFrom || undefined}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1" htmlFor="paymentStatus">
            Payment Status
          </label>
          <select
            id="paymentStatus"
            className="border border-gray-300 rounded px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded px-6 py-2 ml-auto transition"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {passengerStats && (
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-blue-100 rounded shadow text-center">
            <p className="text-xl font-semibold text-blue-700">{passengerStats.totalChallans}</p>
            <p className="text-gray-700 text-sm mt-1">Total Challans</p>
          </div>
          <div className="p-4 bg-green-100 rounded shadow text-center">
            <p className="text-xl font-semibold text-green-700">{passengerStats.paidCount}</p>
            <p className="text-gray-700 text-sm mt-1">Paid</p>
          </div>
          <div className="p-4 bg-red-100 rounded shadow text-center">
            <p className="text-xl font-semibold text-red-700">{passengerStats.unpaidCount}</p>
            <p className="text-gray-700 text-sm mt-1">Unpaid</p>
          </div>
          <div className="p-4 bg-yellow-100 rounded shadow text-center">
            <p className="text-xl font-semibold text-yellow-700">₹{passengerStats.totalFine.toLocaleString()}</p>
            <p className="text-gray-700 text-sm mt-1">Total Fine Amount</p>
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
