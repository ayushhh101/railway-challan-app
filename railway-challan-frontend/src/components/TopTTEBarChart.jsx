
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TopTTEBarChart = () => {
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