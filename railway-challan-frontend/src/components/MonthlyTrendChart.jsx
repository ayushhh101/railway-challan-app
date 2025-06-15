import React from 'react'

const MonthlyTrendChart = ({ trend }) => {

  const formattedData = trend.map(d => ({
    month: `${d._id.month}/${d._id.year}`,
    count: d.count,
  }));

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