import { FunnelIcon, MagnifyingGlassIcon, ArrowPathIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function ChallanFilters({ filters, setFilters, handleFilter, clearFilters, viewType, setViewType }) {
  return (
    <div className="bg-white p-4 shadow rounded-xl space-y-4">
      <div className="text-base font-semibold">
        <FunnelIcon className="h-5 w-4 text-gray-500 mb-1 inline"/> Filter Challans
      </div>
      <div className="flex flex-col md:flex-row gap-3 w-full">
        <div className="flex-1">
          <div className="text-xs mb-1">
            Passenger Name
          </div>
          <input type="text" placeholder="Enter Passenger Name" value={filters.passenger} onChange={e => setFilters({ ...filters, passenger: e.target.value })} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-200 transition outline-none text-sm w-full" />
        </div>


        <div className="flex-1">
           <div className="text-xs mb-1">
            Train Number
          </div>
          <input type="text" placeholder="Enter Train Number" value={filters.train} onChange={e => setFilters({ ...filters, train: e.target.value })} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-200 transition outline-none text-sm w-full" />
        </div>

        <div className="flex-1">
           <div className="text-xs mb-1">
            Reason
          </div>
          <input type="text" placeholder="Enter Reason" value={filters.reason} onChange={e => setFilters({ ...filters, reason: e.target.value })} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-200 transition outline-none text-sm w-full" />
        </div>

        <div className="flex-1">
           <div className="text-xs mb-1">
            Date
          </div>
          <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-200 transition outline-none text-sm w-full" />
        </div>


        <div className="w-25">
          <div className="text-xs mb-1">
            Filter By
          </div>
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="border border-slate-300 rounded-lg w-25 px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-200 transition outline-none text-sm">
          <option value="">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleFilter} className="bg-[#1E40AF] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-900 transition flex items-center gap-1" >
          <MagnifyingGlassIcon className="h-3 text-white " /> Search
          </button>
        <button onClick={clearFilters} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-300 transition flex items-center gap-1">
          <ArrowPathIcon className="h-3 text-black" />Clear
          </button>
        <button onClick={() => setViewType(viewType === 'card' ? 'table' : 'card')} className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition">
          Switch to {viewType === 'card' ? 'Table' : 'Card'} View
        </button>
        <Link to='/monthly-report'>
        <button className="bg-[#1E40AF] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition flex items-center gap-1">
          <CalendarIcon className="h-4 text-white" />Monthly Report
        </button>
      </Link>
      </div>
    </div>
  );
}
