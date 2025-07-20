import React from 'react';
import { Link } from 'react-router-dom';

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
  setCurrentPage
}) => {
  if (filteredChallans.length === 0) return null;

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
            <div className="px-2 pb-3 flex items-center pt-3.5 gap-1 pl-0">
              <span className="text-left text-xs font-medium text-gray-500 uppercase">Select All</span>
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={
                  filteredChallans.length > 0 &&
                  filteredChallans.every(c => selectedChallans.includes(c._id))
                }
                className="w-5 h-5  text-blue-600 border-gray-300 rounded focus:ring-blue-500 "
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedChallans.map((challan, idx) => (
                <div key={idx} className="relative border rounded-xl p-4 shadow pt-6">
                  <input
                    type="checkbox"
                    checked={selectedChallans.includes(challan._id)}
                    onChange={() => toggleChallanSelection(challan._id)}
                    className="absolute top-2 right-2 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <p><span className="font-semibold">Passenger:</span> {challan.passengerName}</p>
                  <p><span className="font-semibold">Train:</span> {challan.trainNumber}</p>
                  <p><span className="font-semibold">Reason:</span> {challan.reason}</p>
                  <p><span className="font-semibold">Amount:</span> ₹{challan.fineAmount}</p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    <span className={challan.paid ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {challan.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </p>

                  <p><span className="font-semibold">Date:</span> {new Date(challan.createdAt).toLocaleDateString()}</p>
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => handleAdminDownload(challan._id)}
                  >
                    Download Receipt PDF
                  </button>
                  <Link
                    to={`/passenger-history?name=${encodeURIComponent(challan.passengerName)}&aadharLast4=${encodeURIComponent(challan.passengerAadharLast4 || '')}`}
                    className="mt-2 inline-block bg-slate-200 px-3 py-1 rounded text-xs text-blue-900 font-semibold hover:bg-blue-100 transition"
                  >
                    View History
                  </Link>


                </div>
              ))}
            </div>
          </>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>

                <th className="px-2 pb-3 flex items-center pt-3.5 gap-1 pl-0">
                  <span className="text-left text-xs font-medium text-gray-500 uppercase">Select All</span>
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      filteredChallans.length > 0 &&
                      filteredChallans.every(c => selectedChallans.includes(c._id))
                    }
                    className="w-5 h-5  text-blue-600 border-gray-300 rounded focus:ring-blue-500 "
                  />
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Download</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">History</th>

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">

              {paginatedChallans.map((challan, idx) => (
                <tr key={idx}>

                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedChallans.includes(challan._id)}
                      onChange={() => toggleChallanSelection(challan._id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{challan.passengerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{challan.trainNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{challan.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{challan.fineAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={challan.paid ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {challan.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">{new Date(challan.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:cursor-pointer"
                    onClick={() => handleAdminDownload(challan._id)}
                  >
                    Download Receipt PDF
                  </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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