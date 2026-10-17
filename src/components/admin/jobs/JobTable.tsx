'use client'

import Link from 'next/link'
import type { JobPosting } from '@/types/database'

type Props = {
  jobs: JobPosting[]
  matchCounts: Record<string, number>
  search: string
  companyFilter: string
  roleFilter: string
  onToggleActive: (id: string, active: boolean) => void
  onDelete?: (job: JobPosting) => void
  onRestore?: (jobId: string) => void
}

export function JobTable({
  jobs,
  matchCounts,
  search,
  companyFilter,
  roleFilter,
  onToggleActive,
  onDelete,
  onRestore,
}: Props) {
  const q = search.trim().toLowerCase()
  const filtered = jobs.filter((j) => {
    if (companyFilter !== 'All' && j.company_name !== companyFilter) return false
    if (roleFilter !== 'All' && j.role_type !== roleFilter.toLowerCase())
      return false
    if (!q) return true
    const hay = `${j.company_name} ${j.role_title} ${j.tech_stack.join(' ')}`.toLowerCase()
    return hay.includes(q)
  })

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white py-12 text-center text-slate">
        No job listings found
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-canvas">
          <tr>
            {[
              'Company',
              'Role',
              'Stack',
              'Payout',
              'Duration',
              'Matches',
              'Status',
              'Actions',
            ].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((j) => {
            const isDeleted = j.deleted === true
            return (
            <tr
              key={j.id}
              className={`border-b border-line last:border-0 hover:bg-canvas ${
                isDeleted ? 'bg-red-50/30' : ''
              }`}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-sm font-bold text-white">
                    {j.company_initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      {j.company_name}
                    </p>
                    <span className="text-xs text-slate">{j.company_stage}</span>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <p className="text-sm font-semibold text-navy">{j.role_title}</p>
                <p className="text-xs text-slate">{j.lead_engineer_name}</p>
              </td>
              <td className="px-5 py-4">
                <div className="flex max-w-[160px] flex-wrap gap-1">
                  {j.tech_stack.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-line bg-canvas px-2 py-0.5 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                  {j.tech_stack.length > 3 ? (
                    <span className="text-xs text-slate">
                      +{j.tech_stack.length - 3}
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-5 py-4">
                <p className="text-sm font-bold text-navy">
                  ${j.payout_amount.toLocaleString()}
                </p>
                <p className="text-xs text-slate">/ {j.sprint_duration}</p>
              </td>
              <td className="px-5 py-4 text-sm text-slate">
                {j.hours_per_week} hrs/wk · Starts in {j.starts_in_days}d
              </td>
              <td className="px-5 py-4 text-sm font-semibold text-teal">
                {matchCounts[j.id] ?? 0}
              </td>
              <td className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => onToggleActive(j.id, !j.is_active)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    j.is_active
                      ? 'border-teal/20 bg-teal-wash text-teal'
                      : 'border-line bg-canvas text-slate'
                  }`}
                >
                  {j.is_active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="px-5 py-4">
                {isDeleted ? (
                  <span className="mr-2 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                    Deleted
                  </span>
                ) : null}
                <Link
                  href={`/admin/jobs/${j.id}`}
                  className="text-sm font-semibold text-blue hover:underline"
                >
                  Edit
                </Link>
                {isDeleted && onRestore ? (
                  <button
                    type="button"
                    onClick={() => onRestore(j.id)}
                    className="ml-3 text-sm font-semibold text-teal"
                  >
                    Restore
                  </button>
                ) : null}
                {!isDeleted && onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(j)}
                    className="ml-3 text-sm font-semibold text-red-500"
                  >
                    Delete
                  </button>
                ) : null}
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  )
}
