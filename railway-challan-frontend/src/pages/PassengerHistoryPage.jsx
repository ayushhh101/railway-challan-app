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
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // For pagination and viewType reuse
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
    const allSelected = results.every((challan) => selectedChallans.includes(challan._id));
    setSelectedChallans(allSelected ? [] : results.map((c) => c._id));
  };

  // Download PDF logic (reuse your admin one)
  const handleAdminDownload = async (challanId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pdf/challan/${challanId}/pdf`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `challan-${challanId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Admin Download error:', err);
      alert('Download failed');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let searchParams = [];
      if (query.name.trim()) searchParams.push(`name=${encodeURIComponent(query.name.trim())}`);
      if (query.aadhar.trim()) searchParams.push(`aadharLast4=${encodeURIComponent(query.aadhar.trim())}`);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/challan/passenger-history?${searchParams.join("&")}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setResults(res.data || []);
      setCurrentPage(1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search on mount if pre-filled query
  useEffect(() => {
    if (query.name || query.aadhar) {
      handleSearch({ preventDefault: () => {} });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-[#1E40AF]">Passenger Challan History</h2>
      <form onSubmit={handleSearch} className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Passenger Name"
          className="border px-4 py-2 rounded text-sm w-64"
          value={query.name}
          onChange={(e) => setQuery((q) => ({ ...q, name: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Aadhar Last 4"
          className="border px-4 py-2 rounded text-sm w-32"
          maxLength={4}
          value={query.aadhar}
          onChange={(e) => setQuery((q) => ({ ...q, aadhar: e.target.value.replace(/\D/, "") }))}
        />
        <button
          className="bg-[#1E40AF] hover:bg-blue-900 text-white rounded px-4 py-2 font-semibold text-sm"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {results.length > 0 ? (
        <ChallanList
          filteredChallans={results}
          selectedChallans={selectedChallans}
          viewType="card"
          paginatedChallans={paginatedChallans}
          totalPages={totalPages}
          currentPage={currentPage}
          handleAdminDownload={handleAdminDownload}
          toggleSelectAll={toggleSelectAll}
          toggleChallanSelection={toggleChallanSelection}
          setCurrentPage={setCurrentPage}
        />
      ) : (
        !loading && <div className="text-gray-500 text-center text-sm mt-12">No challan records found.</div>
      )}
    </div>
  );
}
