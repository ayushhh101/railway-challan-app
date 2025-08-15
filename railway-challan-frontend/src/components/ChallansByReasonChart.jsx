import React from "react";
import { Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0ea5e9', '#ef4444', '#10b981', '#facc15', '#6366f1'];

const ChallansByReasonChart = ({data , stats, error, loading}) => {

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
            <h2 className="text-xl font-semibold mb-2">Challans by Reason</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.challansByReason}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.challansByReason.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
    </>
  )
}

export default ChallansByReasonChart