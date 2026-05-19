import { Search, SlidersHorizontal } from 'lucide-react';
import type { PostStatus } from '../lib/supabase';
const FILTERS: { label: string; value: PostStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Failed', value: 'failed' },
];

interface FilterBarProps {
  activeFilter: PostStatus | 'all';
  onFilterChange: (f: PostStatus | 'all') => void;
  search: string;
  onSearchChange: (s: string) => void;
  sortBy: 'scheduled_at' | 'created_at';
  onSortChange: (s: 'scheduled_at' | 'created_at') => void;
}

export default function FilterBar({
  activeFilter, onFilterChange,
  search, onSearchChange,
  sortBy, onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5 flex-shrink-0">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === f.value
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-shrink-0">
          <SlidersHorizontal size={13} className="text-gray-400" />
          <select
            value={sortBy}
            onChange={e => onSortChange(e.target.value as 'scheduled_at' | 'created_at')}
            className="text-xs text-gray-600 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="scheduled_at">By schedule</option>
            <option value="created_at">By created</option>
          </select>
        </div>
      </div>
    </div>
  );
}
