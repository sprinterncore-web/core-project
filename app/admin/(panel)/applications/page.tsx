'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { ApplicationStatusBadge } from '@/components/student/ApplicationStatusBadge'
import { getAllApplications } from '@/lib/supabase/admin'
import { formatDate, formatSlotShort } from '@/lib/format'
import type { Application } from '@/types/database'

export default function AdminApplicationsPage() {
  const [rows, setRows] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllApplications().then((data) => {
      setRows(data)
      setLoading(false)
    })
  }, [])

  return (
    <AdminShell title="Applications">
      <p className="mb-6 text-sm text-slate">
        Read-only oversight of student applications and interview scheduling.
      </p>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-teal" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-slate">No applications yet.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas">
              <tr>
                {[
                  'Student',
                  'Company',
                  'Role',
                  'Status',
                  'Submitted',
                  'Proposed times',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((app) => (
                <tr key={app.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">
                      {app.student?.full_name ?? '—'}
                    </p>
                    <p className="text-xs text-slate">{app.student?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-navy">
                    {app.company?.company_name ??
                      app.job_posting?.company_name ??
                      '—'}
                  </td>
                  <td className="px-4 py-3 text-navy">
                    {app.job_posting?.role_title ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <ApplicationStatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-slate">
                    {formatDate(app.created_at)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate">
                    {[app.proposed_slot_1, app.proposed_slot_2, app.proposed_slot_3]
                      .filter(Boolean)
                      .map((s) => formatSlotShort(s as string))
                      .join(' · ') || '—'}
                    {app.confirmed_slot ? (
                      <p className="mt-1 font-medium text-blue">
                        Confirmed: {formatSlotShort(app.confirmed_slot)}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  )
}
