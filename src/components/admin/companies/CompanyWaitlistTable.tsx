'use client'

import { formatDate } from '@/lib/format'
import type { CompanyWaitlist, WaitlistStatus } from '@/types/database'

function statusPillClass(status: WaitlistStatus) {
  switch (status) {
    case 'contacted':
      return 'border-blue/20 bg-blue/10 text-blue'
    case 'onboarded':
      return 'border-teal/20 bg-teal-wash text-teal'
    default:
      return 'border-amber-200 bg-amber-50 text-amber-800'
  }
}

type Props = {
  entries: CompanyWaitlist[]
  search: string
  onStatusChange: (id: string, status: WaitlistStatus) => void
}

export function CompanyWaitlistTable({
  entries,
  search,
  onStatusChange,
}: Props) {
  const q = search.trim().toLowerCase()
  const filtered = entries.filter((e) => {
    if (!q) return true
    const hay = `${e.company_name} ${e.first_name} ${e.last_name} ${e.email} ${e.project_type}`.toLowerCase()
    return hay.includes(q)
  })

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white py-12 text-center text-slate">
        No waitlist submissions found
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <p className="border-b border-line bg-amber-50/50 px-5 py-2 text-xs font-semibold text-amber-900">
        Public signup — not yet onboarded to company portal
      </p>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-canvas">
          <tr>
            {['Company', 'Founder', 'Project', 'Submitted', 'Status', 'Actions'].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-xs font-semibold uppercase text-slate"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => (
            <tr key={e.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <p className="font-semibold text-navy">{e.company_name}</p>
                <p className="text-xs text-slate">{e.team_size} team</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-navy">
                  {e.first_name} {e.last_name}
                </p>
                <p className="text-xs text-slate">{e.email}</p>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-blue/8 px-2 py-0.5 text-xs font-semibold text-blue">
                  {e.project_type}
                </span>
              </td>
              <td className="px-4 py-3 text-slate">{formatDate(e.created_at)}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusPillClass(e.status)}`}
                >
                  {e.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <select
                  className="rounded-lg border border-line px-2 py-1 text-xs"
                  value={e.status}
                  onChange={(ev) =>
                    onStatusChange(e.id, ev.target.value as WaitlistStatus)
                  }
                >
                  <option value="waitlist">Waitlist</option>
                  <option value="contacted">Contacted</option>
                  <option value="onboarded">Onboarded</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
