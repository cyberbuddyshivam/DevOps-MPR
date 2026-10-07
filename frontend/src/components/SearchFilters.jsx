import React from 'react';
import { Search, Filter, X, MapPin, Tag } from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Electronics',
  'Documents',
  'Accessories',
  'Clothing',
  'Books',
  'Other'
];

export default function SearchFilters({
  filters,
  onChange,
  onReset
}) {
  const hasActiveFilters =
    filters.q ||
    filters.category !== 'ALL' ||
    filters.location ||
    filters.type !== 'ALL' ||
    filters.status !== 'ALL';

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 mb-6 shadow-xl shadow-black/20 border border-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="search-input"
            type="text"
            placeholder="Search by title, description, or serial..."
            value={filters.q}
            onChange={e => onChange({ ...filters, q: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
          />
          {filters.q && (
            <button
              onClick={() => onChange({ ...filters, q: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Select */}
        <div className="md:col-span-3 relative">
          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            id="category-select"
            value={filters.category}
            onChange={e => onChange({ ...filters, category: e.target.value })}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition appearance-none cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
        </div>

        {/* Location Filter */}
        <div className="md:col-span-4 relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="location-filter"
            type="text"
            placeholder="Filter location (e.g. Library, Canteen)..."
            value={filters.location}
            onChange={e => onChange({ ...filters, location: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Second Row: Type Tabs & Status & Reset */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            id="filter-type-all"
            onClick={() => onChange({ ...filters, type: 'ALL' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filters.type === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Items
          </button>
          <button
            id="filter-type-lost"
            onClick={() => onChange({ ...filters, type: 'LOST' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filters.type === 'LOST'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Lost Only
          </button>
          <button
            id="filter-type-found"
            onClick={() => onChange({ ...filters, type: 'FOUND' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filters.type === 'FOUND'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Found Only
          </button>
        </div>

        {/* Status Toggle & Reset */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden sm:inline">Status:</span>
          <select
            id="status-select"
            value={filters.status}
            onChange={e => onChange({ ...filters, status: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CLAIMED">Claimed</option>
            <option value="CLOSED">Closed</option>
          </select>

          {hasActiveFilters && (
            <button
              id="reset-filters-btn"
              onClick={onReset}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 px-2 py-1.5 transition ml-2"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
