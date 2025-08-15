import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const MonthlyTrendChart = ({ trend , error, loading}) => {

  const formattedData = trend.map(d => ({
    month: `${d._id.month}/${d._id.year}`,
    count: d.count,
  }));

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center min-h-[150px] flex flex-col items-center justify-center">
        <div className="text-red-700 font-semibold mb-1">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center min-h-[150px] flex items-center justify-center">
        <span className="text-blue-600 font-semibold">Loading chart...</span>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Monthly Challan Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}

export default MonthlyTrendChart