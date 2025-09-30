import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MonthlyTrendChart = ({ trend, error, loading }) => {
  if (error) {
    return (
      <div 
        className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 text-center h-[350px] sm:h-[400px] flex flex-col items-center justify-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-base text-red-700 font-semibold leading-normal">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div 
        className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 text-center h-[350px] sm:h-[400px] flex items-center justify-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-base text-blue-600 font-semibold leading-normal">Loading chart...</p>
        </div>
      </div>
    );
  }

  const formattedData = (trend || []).map(d => ({
    month: `${String(d._id.month).padStart(2, '0')}/${String(d._id.year).slice(-2)}`,
    count: d.count,
    fullMonth: new Date(d._id.year, d._id.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
  }));

  if (formattedData.length === 0) {
    return (
      <div 
        className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 text-center h-[350px] sm:h-[400px] flex flex-col items-center justify-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-base text-gray-500 leading-normal">No trend data available</p>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 h-[350px] sm:h-[400px] flex flex-col"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-2">
          Monthly Challan Trend
        </h3>
        <p className="text-sm text-gray-600 leading-normal">
          Issuance trends over recent months
        </p>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={formattedData} 
            margin={{ 
              top: 10, 
              right: 10, 
              left: 10, 
              bottom: 20 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.7} />
            <XAxis 
              dataKey="month" 
              tick={{ 
                fontSize: 11, 
                fill: '#6b7280'
              }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ 
                fontSize: 11, 
                fill: '#6b7280'
              }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '14px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelFormatter={(value, payload) => {
                const data = payload?.[0]?.payload;
                return data?.fullMonth || value;
              }}
              formatter={(value) => [`${value} challans`, 'Total']}
            />
            <Bar 
              dataKey="count" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
              strokeWidth={1}
              stroke="#059669"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;
