import { 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  CalendarIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

export default function ChallanFilters({ filters, setFilters, handleFilter, clearFilters, viewType, setViewType }) {
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div 
      className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <AdjustmentsHorizontalIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Advanced Search & Filters
              </h3>
              <p className="text-sm text-slate-600">
                Find specific challans with powerful filtering options
              </p>
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
                <FunnelIcon className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  {Object.values(filters).filter(v => v !== '').length} Active Filters
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Passenger Name
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter passenger name" 
                value={filters.passenger}
                onChange={e => setFilters({ ...filters, passenger: e.target.value })}
                className="w-full border-2 border-slate-200 hover:border-slate-400 focus:border-blue-500 rounded-xl px-4 py-3 bg-white focus:ring-0 transition-all duration-200 outline-none text-base placeholder:text-slate-400" 
              />
              {filters.passenger && (
                <button
                  onClick={() => setFilters({ ...filters, passenger: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Train Number */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Train Number
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g., 12345" 
                value={filters.train}
                onChange={e => setFilters({ ...filters, train: e.target.value })}
                className="w-full border-2 border-slate-200 hover:border-slate-400 focus:border-blue-500 rounded-xl px-4 py-3 bg-white focus:ring-0 transition-all duration-200 outline-none text-base placeholder:text-slate-400" 
              />
              {filters.train && (
                <button
                  onClick={() => setFilters({ ...filters, train: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Offense Reason
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g., ticketless travel" 
                value={filters.reason}
                onChange={e => setFilters({ ...filters, reason: e.target.value })}
                className="w-full border-2 border-slate-200 hover:border-slate-400 focus:border-blue-500 rounded-xl px-4 py-3 bg-white focus:ring-0 transition-all duration-200 outline-none text-base placeholder:text-slate-400" 
              />
              {filters.reason && (
                <button
                  onClick={() => setFilters({ ...filters, reason: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Issue Date
            </label>
            <div className="relative">
              <input 
                type="date" 
                value={filters.date} 
                onChange={e => setFilters({ ...filters, date: e.target.value })}
                className="w-full border-2 border-slate-200 hover:border-slate-400 focus:border-blue-500 rounded-xl px-4 py-3 bg-white focus:ring-0 transition-all duration-200 outline-none text-base" 
              />
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Payment Status
            </label>
            <div className="relative">
              <select 
                value={filters.status} 
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                className="w-full appearance-none border-2 border-slate-200 hover:border-slate-400 focus:border-blue-500 rounded-xl px-4 py-3 pr-12 bg-white focus:ring-0 transition-all duration-200 outline-none text-base"
              >
                <option value="">All Status</option>
                <option value="paid">✅ Paid</option>
                <option value="unpaid">❌ Unpaid</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleFilter}
              className="bg-blue-600 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold text-base transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              aria-label="Search challans"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Search Challans</span>
            </button>

            <button
              onClick={clearFilters}
              className="bg-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              aria-label="Clear filters"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Clear All</span>
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewType('table')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                viewType === 'table'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
              aria-label="Table view"
            >
              <ViewColumnsIcon className="h-4 w-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewType('card')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                viewType === 'card'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
              aria-label="Card view"
            >
              <Squares2X2Icon className="h-4 w-4" />
              <span>Cards</span>
            </button>
          </div>
        </div>


        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-700 mb-2 sm:mb-0">
              Quick Filters
            </h4>
            <span className="text-sm text-slate-500">
              Click to apply common searches
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Today\'s Challans', filter: { date: new Date().toISOString().split('T')[0] } },
              { label: 'Unpaid Only', filter: { status: 'unpaid' } },
              { label: 'Paid Only', filter: { status: 'paid' } },
              { label: 'Ticketless Travel', filter: { reason: 'ticketless travel' } },
              { label: 'This Week', filter: { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] } }
            ].map((quickFilter, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setFilters({ ...filters, ...quickFilter.filter });
                }}
                className="px-4 py-2 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-blue-300 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {quickFilter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}