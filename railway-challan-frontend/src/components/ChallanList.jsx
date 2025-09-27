import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ChallanList = ({
  filteredChallans,
  selectedChallans,
  viewType,
  paginatedChallans,
  totalPages,
  currentPage,
  handleSelectedExport,
  toggleSelectAll,
  toggleChallanSelection,
  handleAdminDownload,
  setCurrentPage,
  loading = false,
  error = null,
  downloadingId = null,
  itemsPerPage = 8 // Add default value for itemsPerPage
}) => {
  
  // Calculate pagination indices
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  
  // Early returns for different states
  if (filteredChallans.length === 0 && !loading && !error) return null;

  if (loading) {
    return (
      <div 
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="flex flex-col items-center">
          {/* Body Text: 16px */}
          <p className="text-base text-blue-700 font-semibold leading-normal">Loading challans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-base text-red-700 font-semibold mb-4 leading-normal">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 leading-normal"
          aria-label="Retry loading"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!filteredChallans || filteredChallans.length === 0) {
    return (
      <div 
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-base text-gray-500 leading-normal">No challans found</p>
        <p className="text-sm text-gray-400 mt-2 leading-normal">Try adjusting your search criteria</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 leading-tight">
            Search Results
          </h2>
          <p className="text-sm text-gray-600 mt-1 leading-normal">
            Found {filteredChallans.length} challans matching your criteria
          </p>
        </div>

        {selectedChallans.length > 0 && (
          <div className="mt-4 sm:mt-0">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-blue-600 font-medium leading-normal">
                {selectedChallans.length} selected
              </span>
              <button
                onClick={handleSelectedExport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 leading-normal"
                aria-label="Download selected as CSV"
              >
                Export CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {viewType === 'card' ? (
        <>
          <div className="flex items-center space-x-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              onChange={toggleSelectAll}
              checked={
                filteredChallans.length > 0 &&
                filteredChallans.every(c => selectedChallans.includes(c._id))
              }
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              aria-label="Select all challans"
            />
            <label className="text-sm font-medium text-gray-700 leading-normal">
              Select All Challans
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedChallans.map((challan) => (
              <div
                key={challan._id}
                className="relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
              >

                <input
                  type="checkbox"
                  checked={selectedChallans.includes(challan._id)}
                  onChange={() => toggleChallanSelection(challan._id)}
                  className="absolute top-4 right-4 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  aria-label="Select challan"
                />

                <div className="space-y-4 pr-8">

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                      Passenger
                    </label>
                    <p className="text-base font-semibold text-gray-900 leading-normal mt-1">
                      {challan.passengerName}
                    </p>
                    {challan.passengerAadharLast4 && (
                      <p className="text-sm text-gray-600 leading-normal">
                        Aadhar: ****{challan.passengerAadharLast4}
                      </p>
                    )}
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                        Train
                      </label>
                      <p className="text-base font-semibold text-gray-900 leading-normal mt-1">
                        {challan.trainNumber}
                      </p>
                    </div>
                    {challan.coachNumber && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                          Coach
                        </label>
                        <p className="text-base font-semibold text-gray-900 leading-normal mt-1">
                          {challan.coachNumber}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                      Offense
                    </label>
                    <div className="mt-1">
                      <span className="inline-block bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full leading-normal">
                        {challan.reason}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                        Fine Amount
                      </label>
                      <p className="text-lg font-bold text-orange-600 leading-normal mt-1">
                        ₹{challan.fineAmount?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                        Status
                      </label>
                      <div className="mt-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold leading-normal ${
                          challan.paid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {challan.paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                      Issue Date
                    </label>
                    <p className="text-sm text-gray-700 leading-normal mt-1">
                      {formatDate(challan.issuedAt || challan.createdAt)}
                    </p>
                  </div>

                  {challan.issuedBy && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                        Issued By
                      </label>
                      <p className="text-sm text-gray-700 leading-normal mt-1">
                        {challan.issuedBy.name || 'N/A'}
                      </p>
                    </div>
                  )}

                  {challan.location && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                        Location
                      </label>
                      <p className="text-sm text-gray-700 leading-normal mt-1">
                        {challan.location}
                      </p>
                    </div>
                  )}
                </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleAdminDownload(challan._id)}
                      disabled={downloadingId === challan._id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal flex items-center justify-center space-x-2"
                      aria-label="Download receipt PDF"
                    >
                      {downloadingId === challan._id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                    <Link
                      to={`/passenger-history?name=${encodeURIComponent(challan.passengerName)}&aadharLast4=${encodeURIComponent(challan.passengerAadharLast4 ?? '')}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-center leading-normal flex items-center justify-center space-x-2"
                      aria-label="View passenger history"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View History</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Table View */
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 w-16">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                      Select
                    </span>
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        filteredChallans.length > 0 &&
                        filteredChallans.every(c => selectedChallans.includes(c._id))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      aria-label="Select all challans"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider leading-normal">
                  Passenger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider leading-normal">
                  Train/Coach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider leading-normal">
                  Offense
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider leading-normal">
                  Amount
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider leading-normal">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider leading-normal">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider leading-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedChallans.map((challan) => (
                <tr key={challan._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedChallans.includes(challan._id)}
                      onChange={() => toggleChallanSelection(challan._id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      aria-label="Select challan"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-base font-semibold text-gray-900 leading-normal">
                        {challan.passengerName}
                      </div>
                      {challan.passengerAadharLast4 && (
                        <div className="text-sm text-gray-500 leading-normal">
                          ****{challan.passengerAadharLast4}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-semibold text-gray-900 leading-normal">
                      {challan.trainNumber}
                    </div>
                    {challan.coachNumber && (
                      <div className="text-sm text-gray-500 leading-normal">
                        Coach: {challan.coachNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 leading-normal">
                      {challan.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-base font-bold text-orange-600 leading-normal">
                      ₹{challan.fineAmount?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold leading-normal ${
                      challan.paid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {challan.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 leading-normal">
                    {formatDate(challan.issuedAt || challan.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleAdminDownload(challan._id)}
                        disabled={downloadingId === challan._id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium py-1 px-3 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal"
                        aria-label="Download receipt PDF"
                      >
                        {downloadingId === challan._id ? 'Downloading...' : 'PDF'}
                      </button>
                      <Link
                        to={`/passenger-history?name=${encodeURIComponent(challan.passengerName)}&aadharLast4=${encodeURIComponent(challan.passengerAadharLast4 || '')}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium py-1 px-3 rounded transition-colors duration-200 leading-normal"
                        aria-label="View passenger history"
                      >
                        History
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
          {/* Page Info */}
          <div className="flex items-center space-x-2">
            {/* Secondary Text: 14px */}
            <span className="text-sm text-gray-600 leading-normal">
              Showing <span className="font-semibold">{indexOfFirst + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(indexOfLast, filteredChallans.length)}</span> of{' '}
              <span className="font-semibold">{filteredChallans.length}</span> results
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 leading-normal"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <span className="text-sm text-gray-600 leading-normal">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 leading-normal"
              aria-label="Next page"
            >
              Next
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallanList;
