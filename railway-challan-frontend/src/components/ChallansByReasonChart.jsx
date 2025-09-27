import React from "react";
import { Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#ef4444', '#10b981', '#facc15', '#6366f1', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b'];

const ChallansByReasonChart = ({ data, stats, error, loading }) => {
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
        {/* Body Text: 16px */}
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
          {/* Body Text: 16px */}
          <p className="text-base text-blue-600 font-semibold leading-normal">Loading chart...</p>
        </div>
      </div>
    );
  }

  const chartData = stats?.challansByReason || [];

  if (chartData.length === 0) {
    return (
      <div 
        className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 text-center h-[350px] sm:h-[400px] flex flex-col items-center justify-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-base text-gray-500 leading-normal">No offense data available</p>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 h-[350px] sm:h-[400px] flex flex-col"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Chart Header */}
      <div className="mb-4">
        {/* Subsection Headings: 18px */}
        <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
          Challans by Offense Type
        </h3>
        {/* Secondary Text: 14px */}
        <p className="text-sm text-gray-600 leading-normal">
          Distribution across offense categories
        </p>
      </div>
      
      {/* Chart Container */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="_id"
              cx="50%"
              cy="50%"
              outerRadius="60%"
              innerRadius="20%"
              paddingAngle={2}
              label={false}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '14px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => [`${value} challans`, name]}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px',
                paddingTop: '10px'
              }}
              iconType="circle"
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChallansByReasonChart;
