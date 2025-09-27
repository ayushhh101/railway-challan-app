import React from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
  TicketIcon
} from "@heroicons/react/24/outline";

const numberWithCommas = (n) => n?.toLocaleString("en-IN") ?? n ?? 0;

const SummaryCard = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-base text-red-700 font-semibold leading-normal">{error}</p>
      </div>
    );
  }

  const summary = [
    {
      title: "Total Challans",
      value: stats?.totalChallans || 0,
      icon: <TicketIcon className="w-8 h-8 text-blue-600" />,
      change: stats?.totalChallansChange,
      changePos: (stats?.totalChallansChange || 0) >= 0,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-l-blue-500"
    },
    {
      title: "Total Revenue",
      value: <>₹ {numberWithCommas(stats?.totalFineCollected)}</>,
      icon: <CurrencyRupeeIcon className="w-8 h-8 text-green-600" />,
      change: stats?.totalFineCollectedChange,
      changePos: (stats?.totalFineCollectedChange || 0) >= 0,
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      borderColor: "border-l-green-500"
    },
    {
      title: "Paid Challans",
      value: stats?.paidUnpaidStats?.find((s) => s._id === true)?.count || 0,
      icon: <CheckCircleIcon className="w-8 h-8 text-emerald-600" />,
      change: stats?.paidChallansChange,
      changePos: (stats?.paidChallansChange || 0) >= 0,
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      borderColor: "border-l-emerald-500"
    },
    {
      title: "Unpaid Challans",
      value: stats?.paidUnpaidStats?.find((s) => s._id === false)?.count || 0,
      icon: <XCircleIcon className="w-8 h-8 text-red-600" />,
      change: stats?.unpaidChallansChange,
      changePos: (stats?.unpaidChallansChange || 0) >= 0,
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      borderColor: "border-l-red-500"
    },
  ];

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {summary.map((item, idx) => (
        <div
          key={item.title}
          className={`${item.bgColor} rounded-2xl shadow-lg border-l-4 ${item.borderColor} p-6 hover:shadow-xl transition-shadow duration-300`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Form Labels: 14px */}
              <p className="text-sm font-medium text-gray-600 mb-2 leading-normal">
                {item.title}
              </p>
              {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {item.value}
              </p>
              
              {typeof item.change === "number" && (
                <div className="flex items-center space-x-1">
                  {item.changePos ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-600" />
                  )}
                  {/* Small Text: 12px */}
                  <span
                    className={`text-xs font-semibold leading-normal ${
                      item.changePos ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(item.change).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500 leading-normal">
                    vs last month
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 ml-4">
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCard;
