// src/pages/ViewChallansPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ChallanCard from '../components/ChallanCard';

const ViewChallansPage = () => {

  const { token, user } = useAuth();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalChallans, setTotalChallans] = useState(0);

  const [searchMode, setSearchMode] = useState(false);
  const [nameQuery, setNameQuery] = useState('');
  const [aadharQuery, setAadharQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // const paginatedChallans = challans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(challans.length / itemsPerPage);
  const [sortOrder, setSortOrder] = useState('desc');

  const sortedChallans = [...challans].sort((a, b) => {
    const dateA = new Date(a.issuedAt);
    const dateB = new Date(b.issuedAt);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const paginatedChallans = sortedChallans.slice(indexOfFirstItem, indexOfLastItem);


  useEffect(() => {
    if (searchMode) return;
    const fetchChallans = async () => {
      try {
        const res = await axios.get(
          user.role === 'admin'
            ? `${import.meta.env.VITE_API_URL}/api/challan/admin/all`
            : `${import.meta.env.VITE_API_URL}/api/challan/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('API Response:', res.data);

        if (user.role === 'admin') {
          setChallans(res.data.challans || []);
          setTotalChallans(res.data.total || 0);
        } else {
          setChallans(Array.isArray(res.data) ? res.data : []);
          setTotalChallans(res.data.length || 0);
        }

      } catch (err) {
        console.error(err);
        setError('Failed to fetch challans');
      } finally {
        setLoading(false);
      }
    };

    fetchChallans();
  }, [token, user.role, searchMode]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearchMode(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/challan/history?name=${nameQuery}&aadhar=${aadharQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChallans(res.data.challans || []);
      setCurrentPage(1);
      setError(null);

    } catch (err) {
      console.error('Search error:', err);
      setError('No matching records found or server error.');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = async () => {
    setNameQuery('');
    setAadharQuery('');
    setSearchMode(false);
    setLoading(true);

    try {
      const res = await axios.get(
        user.role === 'admin'
          ? `${import.meta.env.VITE_API_URL}/api/challan/admin/all`
          : `${import.meta.env.VITE_API_URL}/api/challan/my`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (user.role === 'admin') {
        setChallans(res.data.challans || []);
      } else {
        setChallans(Array.isArray(res.data) ? res.data : []);
      }

      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to reload original challans.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto bg-[#F8FAFC] min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1E40AF] mb-3 text-center">
        {searchMode
          ? `History for ${nameQuery} (****${aadharQuery})`
          : 'Challan History'}
      </h1>

      {searchMode && (
        <p className="text-center text-sm text-gray-600 mb-4">
          Showing all challans issued to this passenger.
        </p>
      )}

      <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row sm:gap-2 gap-2 justify-center items-center">
        <input
          type="text"
          placeholder="Passenger Name"
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
          className="border px-4 py-2 rounded-md w-full sm:w-1/3"
          required
        />
        <input
          type="text"
          placeholder="Aadhar Last 4"
          value={aadharQuery}
          onChange={(e) => setAadharQuery(e.target.value)}
          className="border px-4 py-2 rounded-md w-full sm:w-1/4"
          maxLength={4}
          required
        />
        <button
          type="submit"
          className="bg-[#1E40AF] text-sm text-white px-2 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-blue-900 transition text-nowrap"
        >
          Search History
        </button>
        {searchMode && (
          <button
            type="button"
            onClick={resetSearch}
            className="text-sm bg-gray-500 rounded-md text-white mt-1 sm:mt-0 px-2 py-1 sm:px-3 sm:py-2 text-nowrap"
          >
            Clear Search
          </button>
        )}

        <div className=" flex justify-center gap-4">
          <label className="flex items-center gap-2 text-sm font-normal text-[#1E40AF]">
            Sort by date:
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="border rounded p-0.5 sm:p-2 text-sm"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </label>
        </div>

      </form>

      <h2 className="text-md font-semibold text-[#1E40AF] mb-2 text-left">Recent Issued Challans</h2>

      {loading ? (
        <div className="text-center text-md text-slate-800 py-8">Loading challans...</div>
      ) : error ? (
        <div className="text-center text-[#DC2626] bg-red-50 border border-red-200 rounded p-4 text-sm">{error}</div>
      ) : challans.length === 0 ? (
        <p className="text-center text-slate-500 text-md">No challans found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          {paginatedChallans.map((challan) => (
            <ChallanCard key={challan._id} challan={challan} />
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6 select-none">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};

export default ViewChallansPage;