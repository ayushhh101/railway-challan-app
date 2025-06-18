{/* Filter UI */}
export default function ChallanFilters({ filters, setFilters, handleFilter, clearFilters, viewType, setViewType }) {
  return (
    <div className="bg-white p-4 shadow rounded-xl space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <input type="text" placeholder="Passenger Name" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Train Number" value={filters.train} onChange={e => setFilters({ ...filters, train: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Reason" value={filters.reason} onChange={e => setFilters({ ...filters, reason: e.target.value })} className="border p-2 rounded" />
        <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} className="border p-2 rounded" />
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="border p-2 rounded">
          <option value="">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleFilter} className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
        <button onClick={clearFilters} className="bg-gray-300 px-4 py-2 rounded">Clear Filters</button>
        <button onClick={() => setViewType(viewType === 'card' ? 'table' : 'card')} className="bg-indigo-500 text-white px-4 py-2 rounded">
          Switch to {viewType === 'card' ? 'Table' : 'Card'} View
        </button>
      </div>
    </div>
  );
}
