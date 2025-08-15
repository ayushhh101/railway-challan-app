
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TopTTEBarChart = ({stats , loading , error}) => {

  if (loading)
    return (
      <div className="bg-white p-8 rounded-xl text-blue-700 text-center font-semibold min-h-[120px]">Loading chart...</div>
    );

  if (error)
    return (
      <div className="bg-white p-8 rounded-xl text-red-700 text-center font-semibold min-h-[120px]">{error}</div>
    );

  return (
    <>
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Top 5 TTEs (by challans)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.challansPerTTE}>
            <XAxis dataKey="tteName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}

export default TopTTEBarChart