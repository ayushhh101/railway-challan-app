import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ChallanCard from '../components/ChallanCard';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  CalendarDaysIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

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

        if (user.role === 'admin') {
          setChallans(res.data.challans || []);
          setTotalChallans(res.data.total || 0);
        } else {
          setChallans(Array.isArray(res.data) ? res.data : []);
          setTotalChallans(res.data.length || 0);
        }

        toast.success('Challans loaded successfully');
      } catch (err) {
        console.error(err);
        setError('Failed to fetch challans');
        toast.error('Failed to load challans');
      } finally {
        setLoading(false);
      }
    };

    fetchChallans();
  }, [token, user.role, searchMode]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!nameQuery.trim() || !aadharQuery.trim()) {
      toast.error('Please enter both passenger name and Aadhar last 4 digits');
      return;
    }

    setLoading(true);
    setSearchMode(true);
    const toastId = toast.loading('Searching challans...');

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/challan/history?name=${nameQuery}&aadhar=${aadharQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChallans(res.data.challans || []);
      setCurrentPage(1);
      setError(null);
      toast.success(`Found ${res.data.challans?.length || 0} challan records`, { id: toastId });
    } catch (err) {
      console.error('Search error:', err);
      setError('No matching records found or server error.');
      toast.error('No matching records found', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = async () => {
    setNameQuery('');
    setAadharQuery('');
    setSearchMode(false);
    setLoading(true);
    const toastId = toast.loading('Reloading all challans...');

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
      toast.success('All challans reloaded', { id: toastId });
    } catch (err) {
      console.error(err);
      setError('Failed to reload original challans.');
      toast.error('Failed to reload challans', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (loading && challans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Loading Challans...</p>
          <p className="text-sm text-slate-500 mt-1">Fetching all records from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <DocumentTextIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-black mb-2">
                  {searchMode
                    ? `History for ${nameQuery} (****${aadharQuery})`
                    : 'Challan Management'}
                </h1>
                <p className="text-lg text-blue-100 font-medium">
                  {searchMode 
                    ? 'All challans issued to the selected passenger'
                    : 'View, search, and manage railway violation records'
                  }
                </p>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                <div className="text-center">
                  <p className="text-blue-100 text-sm font-normal">Total Records</p>
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-2xl font-bold text-white">{challans.length}</span>
                  </div>
                  <p className="text-blue-200 text-xs mt-1">
                    {searchMode ? 'matching search' : 'in system'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8">
        
        {/* Enhanced Search Section */}
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
                  Find specific challan records by passenger details
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSearch} className="space-y-8">
              {/* Search Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Passenger Name Field */}
                <div className="space-y-2">
                  <label htmlFor="passengerName" className="block text-sm font-semibold text-slate-700 mb-2">
                    Passenger Name
                  </label>
                  <div className="relative">
                    <input
                      id="passengerName"
                      type="text"
                      placeholder="Enter passenger's full name"
                      value={nameQuery}
                      onChange={e => setNameQuery(e.target.value)}
                      className="w-full border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white focus:ring-0 transition-all duration-200 outline-none text-base placeholder:text-slate-400"
                      required
                    />
                    {nameQuery && (
                      <button
                        type="button"
                        onClick={() => setNameQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Aadhar Field */}
                <div className="space-y-2">
                  <label htmlFor="aadhar" className="block text-sm font-semibold text-slate-700 mb-2">
                    Aadhar Last 4 Digits
                  </label>
                  <input
                    id="aadhar"
                    type="text"
                    placeholder="Last 4 digits"
                    value={aadharQuery}
                    onChange={e => setAadharQuery(e.target.value.replace(/\D/g, ''))}
                    className="w-full border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white focus:ring-0 transition-all duration-200 outline-none text-base placeholder:text-slate-400"
                    maxLength={4}
                    required
                  />
                </div>

                {/* Sort Field */}
                <div className="space-y-2">
                  <label htmlFor="sortBy" className="block text-sm font-semibold text-slate-700 mb-2">
                    Sort By Date
                  </label>
                  <div className="relative">
                    <select
                      id="sortBy"
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value)}
                      className="w-full appearance-none border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 pr-12 bg-white focus:ring-0 transition-all duration-200 outline-none text-base"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="h-5 w-5" />
                      <span>Search Challans</span>
                    </>
                  )}
                </button>

                {searchMode && (
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                    <span>Clear Search</span>
                  </button>
                )}
              </div>

              {/* Search Info */}
              {searchMode && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-semibold text-blue-800 mb-1">Search Results</h4>
                      <p className="text-sm text-blue-700">
                        Showing all challans issued to <strong>{nameQuery}</strong> with Aadhar ending in <strong>{aadharQuery}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {searchMode ? 'Search Results' : 'Recently Issued Challans'}
                </h2>
                <p className="text-slate-600">
                  {challans.length > 0 
                    ? `Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, challans.length)} of ${challans.length} challans`
                    : 'No challans found'
                  }
                </p>
              </div>
              {loading && (
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-slate-700">Loading...</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-8">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200/50 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-red-800 mb-2">Error Loading Challans</h4>
                    <p className="text-base text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Challan Cards Grid */}
          {!error && challans.length > 0 && (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedChallans.map((challan) => (
                  <ChallanCard key={challan._id} challan={challan} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!error && challans.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DocumentTextIcon className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Challans Found</h3>
              <p className="text-slate-500 mb-6">
                {searchMode 
                  ? 'No challan records match your search criteria. Try adjusting the search terms.'
                  : 'No challans have been issued yet.'
                }
              </p>
              {searchMode && (
                <button
                  onClick={resetSearch}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-200"
                >
                  View All Challans
                </button>
              )}
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-slate-700">
                    Showing <span className="font-bold">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-bold">{Math.min(indexOfLastItem, challans.length)}</span> of{' '}
                    <span className="font-bold">{challans.length}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    aria-label="Previous Page"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    aria-label="Next Page"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewChallansPage;