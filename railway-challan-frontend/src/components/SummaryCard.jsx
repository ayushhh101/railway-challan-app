import React from 'react'; 

import React from 'react'

const SummaryCard = ({stats}) => {
  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Total Challans</p>
          <p className="text-2xl font-semibold">{stats.totalChallans}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Total Fine Collected</p>
          <p className="text-2xl font-semibold">₹ {stats.totalFineCollected}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Paid Challans</p>
          <p className="text-xl">{stats.paidUnpaidStats.find(s => s._id === true)?.count || 0}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-xl">
          <p className="text-gray-500">Unpaid Challans</p>
          <p className="text-xl">{stats.paidUnpaidStats.find(s => s._id === false)?.count || 0}</p>
        </div>
      </div>
    </>
  )
}

export default SummaryCard