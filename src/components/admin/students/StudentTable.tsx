'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import type { Profile, ProfileStatus } from '@/types/database'
import { formatDate, initials } from '@/lib/format'

function profileStatusClass(status: ProfileStatus | undefined) {
  switch (status) {
    case 'verified':
      return 'border-teal/20 bg-teal-wash text-teal'
    case 'active':
      return 'border-blue/20 bg-blue/10 text-blue'
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700'
  }
}

const stickyActionsCell =
  'sticky right-0 z-10 border-l border-line bg-white px-5 py-4 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]'
const stickyActionsHead =
  'sticky right-0 z-10 border-l border-line bg-canvas px-5 py-3'

type Props = {
  students: Profile[]
  searchQuery: string
  statusFilter: string
  roleFilter: string
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
  onGrantAccess?: (student: Profile) => void
  onDelete?: (student: Profile) => void
  onRestore?: (studentId: string) => void
}

export function StudentTable({
  students,
  searchQuery,
  statusFilter,
  roleFilter,
  selectedIds,
  onToggleSelect,
  onGrantAccess,
  onDelete,
  onRestore,
}: Props) {
  const q = searchQuery.trim().toLowerCase()
  const filtered = students.filter((s) => {
    if (statusFilter === 'waitlisted') {
      if (s.portal_access === true) return false
    } else if (statusFilter === 'active') {
      if (s.portal_access !== true) return false
    } else if (statusFilter === 'pending') {
      if (s.profile_status !== 'pending') return false
    } else if (statusFilter === 'complete') {
      if (!s.onboarding_complete) return false
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
        <p className="mt-3 text-slate">No students match this filter</p>
      </div>
    )
  }

  const hasSelect = Boolean(onToggleSelect)

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[1220px] text-left text-sm">
        <thead className="border-b border-line bg-canvas">
          <tr>
            {hasSelect ? (
              <th className="w-12 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate" />
            ) : null}
            <th className="w-[220px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Student
            </th>
            <th className="w-[140px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              University
            </th>
            <th className="w-[100px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Role
            </th>
            <th className="w-[160px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Skills
            </th>
            <th className="w-[100px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Portal
            </th>
            <th className="w-[100px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Review
            </th>
            <th className="w-[160px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Onboarding
            </th>
            <th className="w-[100px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Joined
            </th>
            <th
              className={`${stickyActionsHead} w-[180px] text-left text-xs font-semibold uppercase tracking-wider text-slate`}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => {
            const step = s.onboarding_step ?? 0
            const pct = Math.min(100, (step / 4) * 100)
            const skills = s.skills ?? []
            const isDeleted = s.deleted === true
            const hasPortalAccess = s.portal_access === true
            const rowBg = isDeleted ? 'bg-red-50/30' : 'bg-white'
            return (
              <tr
                key={s.id}
                className={`border-b border-line transition-colors last:border-0 hover:bg-canvas ${rowBg}`}
              >
                {onToggleSelect ? (
                  <td className="w-12 px-3 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds?.has(s.id) ?? false}
                      onChange={() => onToggleSelect(s.id)}
                    />
                  </td>
                ) : null}
                <td className="w-[220px] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                      {initials(s.full_name, s.email)}
                    </div>
                    <div className="min-w-0 max-w-[160px]">
                      <p className="truncate text-sm font-semibold text-navy">
                        {s.full_name ?? '—'}
                      </p>
                      <p className="truncate text-xs text-slate">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="w-[140px] px-4 py-4 text-sm text-navy">
                  <span className="line-clamp-2">{s.university ?? '—'}</span>
                </td>
                <td className="w-[100px] px-4 py-4">
                  <span className="whitespace-nowrap rounded-full bg-blue/10 px-2.5 py-1 text-xs font-medium capitalize text-blue">
                    {s.role_type ?? '—'}
                  </span>
                </td>
                <td className="w-[160px] px-4 py-4">
                  <div className="flex flex-wrap gap-1">
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
                        +{skills.length - 3}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="w-[100px] whitespace-nowrap px-4 py-4">
                  {hasPortalAccess ? (
                    <span className="rounded-full border border-teal/20 bg-teal-wash px-2.5 py-1 text-xs font-semibold text-teal">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      Waitlisted
                    </span>
                  )}
                </td>
                <td className="w-[100px] whitespace-nowrap px-4 py-4">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${profileStatusClass(s.profile_status)}`}
                  >
                    {s.profile_status ?? 'pending'}
                  </span>
                </td>
                <td className="w-[160px] px-4 py-4">
                  <p className="whitespace-nowrap text-xs text-slate">
                    Step {step}/4
                  </p>
                  <div className="mt-1 h-1.5 w-24 rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-teal"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>
                <td className="w-[100px] whitespace-nowrap px-4 py-4 text-sm text-slate">
                  {formatDate(s.created_at)}
                </td>
                <td
                  className={`${stickyActionsCell} w-[180px] whitespace-nowrap ${isDeleted ? 'bg-red-50/30' : 'bg-white'}`}
                >
                  {isDeleted ? (
                    <span className="mr-2 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                      Deleted
                    </span>
                  ) : null}
                  {!hasPortalAccess && onGrantAccess ? (
                    <button
                      type="button"
                      onClick={() => onGrantAccess(s)}
                      className="mr-3 text-sm font-semibold text-blue hover:underline"
                    >
                      Grant Access
                    </button>
                  ) : hasPortalAccess ? (
                    <span className="mr-3 text-sm font-semibold text-teal">
                      ✓ Active
                    </span>
                  ) : null}
                  <Link
                    href={`/admin/students/${s.id}`}
                    className="text-sm font-semibold text-blue hover:underline"
                  >
                    View →
                  </Link>
                  {isDeleted && onRestore ? (
                    <button
                      type="button"
                      onClick={() => onRestore(s.id)}
                      className="ml-3 text-sm font-semibold text-teal"
                    >
                      Restore
                    </button>
                  ) : null}
                  {!isDeleted && onDelete ? (
                    <button
                      type="button"
                      onClick={() => onDelete(s)}
                      className="ml-3 text-sm font-semibold text-red-500"
                    >
                      Delete
                    </button>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
