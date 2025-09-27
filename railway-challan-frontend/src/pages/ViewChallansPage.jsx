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
  <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-neutral-gray50 min-h-screen"
  style={{ fontFamily: 'Inter, sans-serif' }}>
    <div>
      <h1 className="text-center text-2xl sm:text-4xl font-bold text-primary-blue mb-3">
        {searchMode
          ? `History for ${nameQuery} (****${aadharQuery})`
          : 'Challan History'}
      </h1>

      {/* Breadcrumb/Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 leading-normal">
          Total: <span className="font-semibold text-gray-900">{challans.length} challans</span>
        </p>
        <p className="text-xs text-gray-500 leading-normal mt-1 sm:mt-0">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {searchMode && (
        <p className="text-sm text-gray-600 mb-4">
          Showing all challans issued to this passenger.
        </p>
      )}
    </div>

    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
      {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
      <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100 leading-tight">
        Search Challans
      </h2>

      <form onSubmit={handleSearch} className="space-y-6">
        {/* Search Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {/* Passenger Name Field */}
          <div>
            {/* Form Labels: 14-16px */}
            <label htmlFor="passengerName" className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
              Passenger Name
            </label>
            {/* Form Inputs: 16px */}
            <input
              id="passengerName"
              type="text"
              placeholder="Enter passenger's full name"
              value={nameQuery}
              onChange={e => setNameQuery(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
              required
            />
          </div>

          {/* Aadhar Field */}
          <div>
            <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
              Aadhar Last 4 Digits
            </label>
            <input
              id="aadhar"
              type="text"
              placeholder="Last 4 digits"
              value={aadharQuery}
              onChange={e => setAadharQuery(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
              maxLength={4}
              pattern="[0-9]{4}"
              required
            />
          </div>

          {/* Sort Field */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
              Sort By Date
            </label>
            <div className="relative">
              <select
                id="sortBy"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="w-full appearance-none border border-gray-300 px-4 py-3 pr-10 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white leading-relaxed"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Single Line */}
        <div className="flex flex-row flex-nowrap gap-3 items-center">
          {/* Buttons/CTAs: 16px */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-base font-semibold px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal whitespace-nowrap"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </div>
            ) : (
              'Search Challans'
            )}
          </button>

          {searchMode && (
            <button
              type="button"
              onClick={resetSearch}
              className="bg-gray-500 hover:bg-gray-600 text-white text-base font-medium px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 leading-normal whitespace-nowrap"
            >
              Clear Search
            </button>
          )}
        </div>
      </form>
    </div>

    <h2 className="text-md font-semibold text-primary-blue mt-3 mb-2 text-left">Recently Issued Challans</h2>

    {loading ? (
      <div className="text-center text-md text-slate-800 py-8">Loading challans...</div>
    ) : error ? (
      <div className="text-center text-secondary-danger-red bg-secondary-danger-light border border-secondary-danger-red rounded-2xl p-4 text-sm">{error}</div>
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
          className={`px-4 py-2 rounded-2xl border border-neutral-gray300 text-neutral-gray700 hover:bg-neutral-gray100 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Previous Page"
        >
          Previous
        </button>
        <span className="text-sm font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-2xl border border-neutral-gray300 text-neutral-gray700 hover:bg-neutral-gray100 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Next Page"
        >
          Next
        </button>
      </div>
    )}
  </div>
);

};

export default ViewChallansPage;