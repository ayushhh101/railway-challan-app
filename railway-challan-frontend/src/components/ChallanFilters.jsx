import { FunnelIcon, MagnifyingGlassIcon, ArrowPathIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function ChallanFilters({ filters, setFilters, handleFilter, clearFilters, viewType, setViewType }) {
  return (
    <div 
      className="space-y-6"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <FunnelIcon className="h-6 w-6 text-blue-600" />
        {/* Subsection Headings: 18px */}
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          Search Filters
        </h3>
      </div>

      {/* Filter Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Passenger Name */}
        <div>
          {/* Form Labels: 14-16px */}
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
            Passenger Name
          </label>
          {/* Form Inputs: 16px */}
          <input 
            type="text" 
            placeholder="Enter passenger name" 
            value={filters.passenger}
            onChange={e => setFilters({ ...filters, passenger: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-base leading-relaxed" 
          />
        </div>

        {/* Train Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
            Train Number
          </label>
          <input 
            type="text" 
            placeholder="Enter train number" 
            value={filters.train}
            onChange={e => setFilters({ ...filters, train: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-base leading-relaxed" 
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
            Offense Reason
          </label>
          <input 
            type="text" 
            placeholder="Enter offense reason" 
            value={filters.reason}
            onChange={e => setFilters({ ...filters, reason: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-base leading-relaxed" 
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
            Issue Date
          </label>
          <input 
            type="date" 
            value={filters.date} 
            onChange={e => setFilters({ ...filters, date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-base leading-relaxed" 
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
            Payment Status
          </label>
          <div className="relative">
            <select 
              value={filters.status} 
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 pr-10 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-base leading-relaxed"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Buttons/CTAs: 16px */}
        <button
          onClick={handleFilter}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal"
          aria-label="Search challans"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
          <span>Search</span>
        </button>

        <button
          onClick={clearFilters}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 leading-normal"
          aria-label="Clear filters"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>Clear</span>
        </button>

        <button
          onClick={() => setViewType(viewType === 'card' ? 'table' : 'card')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 leading-normal"
          aria-label="Toggle view type"
        >
          Switch to {viewType === 'card' ? 'Table' : 'Card'} View
        </button>
      </div>
    </div>
  );
}
