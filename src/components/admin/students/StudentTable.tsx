'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import type { Profile, ProfileStatus } from '@/types/database'
import { formatDate, initials } from '@/lib/format'

function statusClass(status: ProfileStatus | undefined) {
  switch (status) {
    case 'verified':
      return 'border-teal/20 bg-teal-wash text-teal'
    case 'active':
      return 'border-blue/20 bg-blue/10 text-blue'
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700'
  }
}

type Props = {
  students: Profile[]
  searchQuery: string
  statusFilter: string
  roleFilter: string
}

export function StudentTable({
  students,
  searchQuery,
  statusFilter,
  roleFilter,
}: Props) {
  const q = searchQuery.trim().toLowerCase()
  const filtered = students.filter((s) => {
    if (statusFilter !== 'All' && s.profile_status !== statusFilter.toLowerCase()) {
      return false
    }
    if (roleFilter !== 'All' && s.role_type !== roleFilter.toLowerCase()) {
      return false
    }
    if (!q) return true
    const hay = `${s.full_name} ${s.email} ${s.university}`.toLowerCase()
    return hay.includes(q)
  })

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white py-16 text-center">
        <Users size={40} className="mx-auto text-slate/30" />
        <p className="mt-3 text-slate">No students yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-canvas">
          <tr>
            {[
              'Student',
              'University',
              'Role',
              'Skills',
              'Status',
              'Onboarding',
              'Joined',
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
          {filtered.map((s) => {
            const step = s.onboarding_step ?? 0
            const pct = Math.min(100, (step / 4) * 100)
            const skills = s.skills ?? []
            return (
              <tr
                key={s.id}
                className="border-b border-line transition-colors last:border-0 hover:bg-canvas"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                      {initials(s.full_name, s.email)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {s.full_name ?? '—'}
                      </p>
                      <p className="text-xs text-slate">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-navy">
                  {s.university ?? '—'}
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-blue/10 px-2.5 py-1 text-xs font-medium capitalize text-blue">
                    {s.role_type ?? '—'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex max-w-[180px] flex-wrap gap-1">
                    {skills.slice(0, 3).map((sk) => (
                      <span
                        key={sk}
                        className="rounded-full border border-line bg-canvas px-2 py-0.5 text-xs text-navy"
                      >
                        {sk}
                      </span>
                    ))}
                    {skills.length > 3 ? (
                      <span className="text-xs text-slate">
                        +{skills.length - 3} more
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(s.profile_status)}`}
                  >
                    {s.profile_status ?? 'pending'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <p className="text-xs text-slate">Step {step}/4</p>
                  <div className="mt-1 h-1.5 w-16 rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-teal"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate">
                  {formatDate(s.created_at)}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/students/${s.id}`}
                    className="text-sm font-semibold text-blue hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
