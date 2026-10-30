'use client'

import Link from 'next/link'
import type { Company } from '@/types/database'
import { Toggle } from '@/components/ui/Toggle'

const stickyActionsCell =
  'sticky right-0 z-10 border-l border-line bg-white px-5 py-4 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]'
const stickyActionsHead =
  'sticky right-0 z-10 border-l border-line bg-canvas px-5 py-3'

type Props = {
  companies: Company[]
  search: string
  onToggleAccess: (id: string, access: boolean) => void
  onDelete?: (company: Company) => void
  onRestore?: (companyId: string) => void
}

export function CompanyTable({
  companies,
  search,
  onToggleAccess,
  onDelete,
  onRestore,
}: Props) {
  const q = search.trim().toLowerCase()
  const filtered = companies.filter((c) => {
    if (!q) return true
    return `${c.company_name} ${c.contact_email} ${c.contact_name}`
      .toLowerCase()
      .includes(q)
  })

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white py-12 text-center text-slate">
        No companies found
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="border-b border-line bg-canvas">
          <tr>
            <th className="w-[220px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Company
            </th>
            <th className="w-[180px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Contact
            </th>
            <th className="w-[120px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Stage
            </th>
            <th className="w-[120px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Status
            </th>
            <th className="w-[80px] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate">
              Call
            </th>
            <th className="w-[100px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate">
              Access
            </th>
            <th
              className={`${stickyActionsHead} w-[160px] text-left text-xs font-semibold uppercase tracking-wider text-slate`}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => {
            const isDeleted = c.deleted === true
            return (
              <tr
                key={c.id}
                className={`border-b border-line last:border-0 hover:bg-canvas ${
                  isDeleted ? 'bg-red-50/30' : ''
                }`}
              >
                <td className="w-[220px] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-sm font-bold text-white">
                      {c.company_initial}
                    </div>
                    <div className="min-w-0 max-w-[160px]">
                      <p className="truncate text-sm font-semibold text-navy">
                        {c.company_name}
                      </p>
                      <p className="truncate text-xs text-slate">
                        {c.website ?? '—'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="w-[180px] px-4 py-4 text-sm">
                  <p className="truncate text-navy">{c.contact_name}</p>
                  <p className="truncate text-xs text-slate">{c.contact_email}</p>
                </td>
                <td className="w-[120px] px-4 py-4">
                  <span className="whitespace-nowrap rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                    {c.stage}
                  </span>
                </td>
                <td className="w-[120px] whitespace-nowrap px-4 py-4">
                  {c.status === 'active' ? (
                    <span className="rounded-full border border-teal/20 bg-teal-wash px-2.5 py-1 text-xs font-semibold text-teal">
                      ✓ Active
                    </span>
                  ) : c.status === 'inactive' ? (
                    <span className="rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-slate">
                      Inactive
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      ⏳ Pending
                    </span>
                  )}
                </td>
                <td className="w-[80px] px-4 py-4 text-center text-sm">
                  {c.call_booked ? (
                    <span className="text-teal">✓</span>
                  ) : (
                    <span className="text-slate/40">—</span>
                  )}
                </td>
                <td className="w-[100px] px-4 py-4">
                  <Toggle
                    checked={c.platform_access}
                    onChange={(v) => onToggleAccess(c.id, v)}
                  />
                </td>
                <td
                  className={`${stickyActionsCell} w-[160px] whitespace-nowrap ${isDeleted ? 'bg-red-50/30' : 'bg-white'}`}
                >
                  {isDeleted ? (
                    <span className="mr-2 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                      Deleted
                    </span>
                  ) : null}
                  <Link
                    href={`/admin/companies/${c.id}`}
                    className="text-sm font-semibold text-blue hover:underline"
                  >
                    Edit →
                  </Link>
                  {isDeleted && onRestore ? (
                    <button
                      type="button"
                      onClick={() => onRestore(c.id)}
                      className="ml-3 text-sm font-semibold text-teal"
                    >
                      Restore
                    </button>
                  ) : null}
                  {!isDeleted && onDelete ? (
                    <button
                      type="button"
                      onClick={() => onDelete(c)}
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
