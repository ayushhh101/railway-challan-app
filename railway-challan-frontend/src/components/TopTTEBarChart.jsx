import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TopTTEBarChart = ({ stats, loading, error }) => {
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

  const chartData = (stats?.challansPerTTE || []).slice(0, 5).map(tte => ({
    ...tte,
    displayName: tte.tteName.length > 10 ? `${tte.tteName.slice(0, 8)}...` : tte.tteName
  }));

  if (chartData.length === 0) {
    return (
      <div 
        className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 text-center h-[350px] sm:h-[400px] flex flex-col items-center justify-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-base text-gray-500 leading-normal">No TTE data available</p>
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
          Top 5 TTEs Performance
        </h3>
        {/* Secondary Text: 14px */}
        <p className="text-sm text-gray-600 leading-normal">
          Ranked by number of challans issued
        </p>
      </div>
      
      {/* Chart Container */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ 
              top: 10, 
              right: 10, 
              left: 10, 
              bottom: 40 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.7} />
            <XAxis 
              dataKey="displayName" 
              tick={{ 
                fontSize: 10, 
                fill: '#6b7280'
              }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
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
              formatter={(value, name, props) => [
                `${value} challans`,
                `${props.payload.tteName} (${props.payload.employeeId})`
              ]}
              labelFormatter={() => ''}
            />
            <Bar 
              dataKey="count" 
              fill="#0ea5e9" 
              radius={[4, 4, 0, 0]}
              strokeWidth={1}
              stroke="#0284c7"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopTTEBarChart;
