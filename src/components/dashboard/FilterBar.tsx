'use client'

import { ChevronDown, Search } from 'lucide-react'

type FilterBarProps = {
  onFilterChange: (filter: string) => void
  onSortChange: (sort: string) => void
  searchValue: string
  onSearchChange: (val: string) => void
}

export function FilterBar({
  onFilterChange,
  onSortChange,
  searchValue,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/50"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by tech stack or keyword..."
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-4 text-sm text-navy placeholder:text-slate/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10"
          />
        </div>

        <button
          type="button"
          onClick={() => onFilterChange('payout')}
          className="rounded-full bg-teal px-4 py-2.5 text-sm font-semibold text-white"
        >
          Filter by payout ▾
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('duration')}
          className="rounded-full border border-line px-4 py-2.5 text-sm text-slate transition-all hover:border-navy hover:text-navy"
        >
          Duration ▾
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('scope')}
          className="rounded-full border border-line px-4 py-2.5 text-sm text-slate transition-all hover:border-navy hover:text-navy"
        >
          Scope ▾
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate">Sort by:</span>
        <button
          type="button"
          onClick={() => onSortChange('calibration')}
          className="flex items-center gap-1 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-navy"
        >
          Match Calibration (Highest first)
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  )
}
