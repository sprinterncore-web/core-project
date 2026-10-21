'use client'

import { Trophy } from 'lucide-react'

export function SprintHistory() {
  return (
    <div className="mt-5 rounded-2xl border border-line bg-white p-6">
      <h3 className="text-base font-bold text-navy">Sprint History</h3>
      <Trophy size={32} className="mx-auto mt-4 text-slate/20" />
      <p className="mt-3 text-center text-sm text-slate">No sprints yet</p>
      <p className="mx-auto mt-1 max-w-[200px] text-center text-xs leading-relaxed text-slate/60">
        Completed sprints, company ratings and earnings will appear here after
        your first sprint.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-canvas p-3 text-center">
          <p className="text-xl font-bold text-navy">—</p>
          <p className="text-xs text-slate/60">Sprints</p>
        </div>
        <div className="rounded-xl bg-canvas p-3 text-center">
          <p className="text-xl font-bold text-navy">—</p>
          <p className="text-xs text-slate/60">Earnings</p>
        </div>
      </div>
    </div>
  )
}
