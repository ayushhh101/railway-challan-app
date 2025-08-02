import React from 'react'

const SummaryCard = ({stats}) => {
  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white flex flex-col items-start justify-center p-6 border border-slate-100 shadow">
          <p className="text-xs font-semibold text-slate-400 mb-1">Total Challans</p>
          <p className="text-2xl font-bold">{stats.totalChallans}</p>
        </div>
        <div className="rounded-2xl bg-white flex flex-col items-start justify-center p-6 border border-slate-100 shadow">
          <p className="text-xs font-semibold text-slate-400 mb-1">Total Fine Collected</p>
          <p className="text-2xl font-bold">₹ {stats.totalFineCollected}</p>
        </div>
        <div className="rounded-2xl bg-white flex flex-col items-start justify-center p-6 border border-slate-100 shadow">
          <p className="text-xs font-semibold text-slate-400 mb-1">Paid Challans</p>
          <p className="text-2xl font-bold">{stats.paidUnpaidStats.find(s => s._id === true)?.count || 0}</p>
        </div>
        <div className="rounded-2xl bg-white flex flex-col items-start justify-center p-6 border border-slate-100 shadow">
          <p className="text-xs font-semibold text-slate-400 mb-1">Unpaid Challans</p>
          <p className="text-2xl font-bold">{stats.paidUnpaidStats.find(s => s._id === false)?.count || 0}</p>
        </div>
      </div>
    </>
  )
}

export default SummaryCard