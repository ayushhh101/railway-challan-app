import { FunnelIcon, MagnifyingGlassIcon, ArrowPathIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function ChallanFilters({ filters, setFilters, handleFilter, clearFilters, viewType, setViewType }) {
  return (
    <div className="bg-white p-3 sm:p-4 shadow rounded-xl space-y-4">
      <div className="text-lg font-semibold">
        <FunnelIcon className="h-5 w-4 text-gray-500 mb-1 inline" /> Filter Challans
      </div>
      <div className="flex flex-col md:flex-row gap-3 w-full">
        <div className="flex-1">
          <div className="text-xs mb-1">
            Passenger Name
          </div>
          <input type="text" placeholder="Enter Passenger Name" value={filters.passenger}
            onChange={e => setFilters({ ...filters, passenger: e.target.value })}
            className="flex-1 border border-neutral-gray300 rounded-2xl px-3 py-2 bg-neutral-gray50 focus:ring-2 focus:ring-primary-light transition outline-none text-sm w-full" />
        </div>


        <div className="flex-1">
          <div className="text-xs mb-1">
            Train Number
          </div>
          <input type="text" placeholder="Enter Train Number" value={filters.train}
            onChange={e => setFilters({ ...filters, train: e.target.value })}
            className="flex-1 border border-neutral-gray300 rounded-2xl px-3 py-2 bg-neutral-gray50 focus:ring-2 focus:ring-primary-light transition outline-none text-sm w-full" />
        </div>

        <div className="flex-1">
          <div className="text-xs mb-1">
            Reason
          </div>
          <input type="text" placeholder="Enter Reason" value={filters.reason}
            onChange={e => setFilters({ ...filters, reason: e.target.value })}
            className="flex-1 border border-neutral-gray300 rounded-2xl px-3 py-2 bg-neutral-gray50 focus:ring-2 focus:ring-primary-light transition outline-none text-sm w-full" />
        </div>

        <div className="flex-1">
          <div className="text-xs mb-1">
            Date
          </div>
          <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })}
            className="flex-1 border border-neutral-gray300 rounded-2xl px-3 py-2 bg-neutral-gray50 focus:ring-2 focus:ring-primary-light transition outline-none text-sm w-full" />
        </div>


        <div className="w-25">
          <div className="text-xs mb-1">
            Filter By
          </div>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="border border-neutral-gray300 rounded-2xl w-25 px-3 py-2 bg-neutral-gray50 focus:ring-2 focus:ring-primary-light transition outline-none text-sm">
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 place-items-center sm:flex sm:flex-row sm:items-center sm:gap-4 w-auto">
        <button
          aria-label="Search"
          onClick={handleFilter}
          className="bg-primary-blue text-white px-4 py-2 rounded-2xl font-semibold text-sm hover:bg-primary-dark transition flex items-center gap-1 w-fit"
        >
          <MagnifyingGlassIcon className="h-3 text-white" /> Search
        </button>
        <button
          aria-label="Clear Filter"
          onClick={clearFilters}
          className="bg-neutral-gray200 text-neutral-gray900 px-4 py-2 rounded-2xl font-semibold text-sm hover:bg-neutral-gray300 transition flex items-center gap-1 w-fit"
        >
          <ArrowPathIcon className="h-3 text-neutral-gray900" /> Clear
        </button>
        <button
          aria-label="Toggle View"
          onClick={() => setViewType(viewType === 'card' ? 'table' : 'card')}
          className="bg-mint-500 text-white px-4 py-2 rounded-2xl font-semibold text-sm hover:bg-mint-500/80 transition  w-fit text-nowrap"
        >
          Switch to {viewType === 'card' ? 'Table' : 'Card'} View
        </button>
        <div>
          <Link to='/monthly-report' className="w-full">
            <button
              aria-label="Monthly Report Page"
              className="bg-primary-blue text-white px-4 py-2 rounded-2xl font-semibold text-sm hover:bg-primary-dark transition flex items-center gap-1 w-fit"
            >
              <CalendarIcon className="h-4 text-white" /> Monthly Report
            </button>
          </Link>
        </div>
      </div>
      
    </div>
  );
}
