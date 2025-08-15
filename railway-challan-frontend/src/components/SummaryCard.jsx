import React from 'react'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
  TicketIcon
} from "@heroicons/react/24/outline";

const numberWithCommas = (n) =>
  n?.toLocaleString("en-IN") ?? n ?? 0;

const borderColors = [
  "border-l-4 border-l-blue-700",    // dark blue for Total Challans
  "border-l-4 border-l-green-500",   // green for Total Fine Collected
  "border-l-4 border-l-yellow-400",  // yellow for Paid Challans
  "border-l-4 border-l-red-400"      // red for Unpaid Challans
];

const SummaryCard = ({ stats , loading , error, onRetry }) => {
   if (loading) {
    return (
      <div className="bg-white p-10 rounded-xl text-center text-blue-700 text-base font-semibold">
        Loading summary...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white p-10 rounded-xl text-center">
        <div className="mb-3 text-red-700 font-semibold">{error}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const summary = [
    {
      title: "Total Challans",
      value: stats.totalChallans,
      icon: <TicketIcon className="w-7 h-7 text-blue-500" />,
      change: stats.totalChallansChange,
      changePos: stats.totalChallansChange >= 0,
    },
    {
      title: "Total Fine Collected",
      value: <>₹ {numberWithCommas(stats.totalFineCollected)}</>,
      icon: <CurrencyRupeeIcon className="w-7 h-7 text-green-500" />,
      change: stats.totalFineCollectedChange,
      changePos: stats.totalFineCollectedChange >= 0,
    },
    {
      title: "Paid Challans",
      value: stats.paidUnpaidStats?.find((s) => s._id === true)?.count || 0,
      icon: <CheckCircleIcon className="w-7 h-7 text-green-600" />,
      change: stats.paidChallansChange,
      changePos: stats.paidChallansChange >= 0,
    },
    {
      title: "Unpaid Challans",
      value: stats.paidUnpaidStats?.find((s) => s._id === false)?.count || 0,
      icon: <XCircleIcon className="w-7 h-7 text-red-500" />,
      change: stats.unpaidChallansChange,
      changePos: stats.unpaidChallansChange >= 0,
    },
  ];
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s, idx) => (
          <div
            key={s.title}
            className={`relative rounded-xl bg-white flex flex-row items-center justify-between p-6 border border-slate-100 shadow ${borderColors[idx]}`}
          >
            {/* Content */}
            <div className="flex flex-col justify-between">
              <div className="text-sm font-semibold text-slate-400 mb-1">{s.title}</div>
              <div className="text-2xl font-bold text-[#262B43]">
                {s.value}
              </div>
              <div className="flex items-center mt-1">
                {typeof s.change === "number" ? (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold
                    ${s.changePos ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {s.changePos
                      ? <ArrowUpIcon className="w-4 h-4" />
                      : <ArrowDownIcon className="w-4 h-4" />}
                    {Math.abs(s.change)}%
                    <span className="ml-1 font-normal text-slate-400">
                      since last month
                    </span>
                  </span>
                ) : null}
              </div>
            </div>
            <div className="absolute right-5 top-5">
              {s.icon}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default SummaryCard