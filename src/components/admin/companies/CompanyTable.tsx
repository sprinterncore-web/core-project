'use client'

import Link from 'next/link'
import type { Company } from '@/types/database'
import { Toggle } from '@/components/ui/Toggle'

type Props = {
  companies: Company[]
  search: string
  onToggleAccess: (id: string, access: boolean) => void
}

export function CompanyTable({ companies, search, onToggleAccess }: Props) {
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
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-canvas">
          <tr>
            {[
              'Company',
              'Contact',
              'Stage',
              'Status',
              'Call',
              'Access',
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
          {filtered.map((c) => (
            <tr
              key={c.id}
              className="border-b border-line last:border-0 hover:bg-canvas"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-sm font-bold text-white">
                    {c.company_initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      {c.company_name}
                    </p>
                    <p className="text-xs text-slate">{c.website ?? '—'}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-sm">
                <p className="text-navy">{c.contact_name}</p>
                <p className="text-xs text-slate">{c.contact_email}</p>
              </td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                  {c.stage}
                </span>
              </td>
              <td className="px-5 py-4">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                    c.status === 'active'
                      ? 'border-teal/20 bg-teal-wash text-teal'
                      : c.status === 'inactive'
                        ? 'border-line bg-canvas text-slate'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {c.status}
                </span>
              </td>
              <td className="px-5 py-4 text-center text-sm">
                {c.call_booked ? (
                  <span className="text-teal">✓</span>
                ) : (
                  <span className="text-slate/40">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                <Toggle
                  checked={c.platform_access}
                  onChange={(v) => onToggleAccess(c.id, v)}
                />
              </td>
              <td className="px-5 py-4">
                <Link
                  href={`/admin/companies/${c.id}`}
                  className="text-sm font-semibold text-blue hover:underline"
                >
                  Edit →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
