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
  error = null
}) => {
  if (filteredChallans.length === 0) return null;
  if (loading)
    return (
      <div className="bg-white p-10 rounded-xl text-center text-blue-700 text-base font-semibold">
        Loading challans...
      </div>
    );

  if (error)
    return (
      <div className="bg-white p-10 rounded-xl text-center">
        <div className="mb-3 text-red-700 font-semibold">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );

  if (!filteredChallans || filteredChallans.length === 0)
    return (
      <div className="bg-white p-10 rounded-xl text-center text-gray-500 text-base">
        No challans found.
      </div>
    );

  return (
    <>
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Filtered Results</h2>
        {selectedChallans.length > 0 && (
          <div className="flex gap-4">
            <button
              onClick={handleSelectedExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
            >
              Download Selected CSV
            </button>
          </div>
        )}

        {viewType === 'card' ? (
          <>
            <div className="px-2 pb-3 flex items-center pt-3.5 gap-2 pl-0">
              <span className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Select All</span>
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={
                  filteredChallans.length > 0 &&
                  filteredChallans.every(c => selectedChallans.includes(c._id))
                }
                className="w-5 h-5 text-blue-600 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Select All Challans"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedChallans.map((challan) => (
                <div
                  key={challan._id}
                  className="relative bg-white border border-slate-300 rounded-xl p-4 shadow hover:shadow-lg hover:scale-[1.02] transition-transform duration-150"
                >
                  <input
                    type="checkbox"
                    checked={selectedChallans.includes(challan._id)}
                    onChange={() => toggleChallanSelection(challan._id)}
                    className="absolute top-3 right-3 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    aria-label="Select Challan"
                  />
                  <div className="flex flex-col space-y-1.5 pb-2">
                    <p>
                      <span className="font-semibold text-gray-600">Passenger:</span>
                      <span className="pl-2 text-blue-950 font-medium">{challan.passengerName}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">Train:</span>
                      <span className="pl-2">{challan.trainNumber}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">Reason:</span>
                      <span className="pl-2 inline-block bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-semibold">
                        {challan.reason}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">Amount:</span>
                      <span className="pl-2 text-yellow-700 font-bold">₹{challan.fineAmount}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-0.5 rounded font-semibold text-xs ${challan.paid
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        {challan.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">Date:</span>
                      <span className="pl-2">{new Date(challan.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div className="flex flex-row flex-wrap gap-2 pt-2">
                    <button
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-800 text-white text-xs font-semibold rounded px-3 py-1 shadow transition"
                      onClick={() => handleAdminDownload(challan._id)}
                      aria-label="Download Receipt PDF"
                    >
                      Receipt PDF
                    </button>
                    <Link
                      to={`/passenger-history?name=${encodeURIComponent(challan.passengerName)}&aadharLast4=${encodeURIComponent(challan.passengerAadharLast4 ?? '')}`}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-100 text-blue-900 font-semibold text-xs rounded px-3 py-1 shadow transition"
                      aria-label="View Passenger History"
                    >
                      View History
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>

                  <th className="w-16 px-2 py-3">
                    <div className='flex flex-col items-center justify-center '>
                      <span className="text-center text-xs font-medium text-gray-500 uppercase mb-1">Select All</span>
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={
                          filteredChallans.length > 0 &&
                          filteredChallans.every(c => selectedChallans.includes(c._id))
                        }
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 inline"
                      />
                    </div>
                  </th>

                  <th className="w-32 px-5 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase">Passenger Name</th>
                  <th className="w-24 px-5 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase">Train</th>
                  <th className="w-32 px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase text-wrap">Reason</th>
                  <th className="w-20 px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="w-20 px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="w-24 px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="w-28 px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Download</th>
                  <th className="w-24 px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">History</th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">

                {paginatedChallans.map((challan, idx) => (
                  <tr key={idx}>

                    <td className="px-2 py-2 text-center w-16">
                      <input
                        type="checkbox"
                        checked={selectedChallans.includes(challan._id)}
                        onChange={() => toggleChallanSelection(challan._id)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2 max-w-xs truncate">{challan.passengerName}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{challan.trainNumber}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{challan.reason}</td>
                    <td className="px-3 py-2 whitespace-nowrap">₹{challan.fineAmount}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={challan.paid ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {challan.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">{new Date(challan.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap"><button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:cursor-pointer"
                      onClick={() => handleAdminDownload(challan._id)}
                    >
                      Receipt PDF
                    </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Link
                        to={`/passenger-history?name=${encodeURIComponent(challan.passengerName)}&aadharLast4=${encodeURIComponent(challan.passengerAadharLast4 || '')}`}
                        className="bg-slate-200 px-3 py-1 rounded text-blue-900 font-semibold text-xs hover:bg-blue-100"
                      >
                        View History
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>

  );
};

export default ChallanList;