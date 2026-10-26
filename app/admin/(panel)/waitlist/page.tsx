'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, Clock, UserCheck, Users } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { StatCard } from '@/components/ui/StatCard'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/lib/format'
import {
  getCompanyWaitlist,
  updateWaitlistStatus,
} from '@/lib/supabase/waitlist'
import type { CompanyWaitlist, WaitlistStatus } from '@/types/database'

function statusPillClass(status: WaitlistStatus) {
  switch (status) {
    case 'contacted':
      return 'bg-blue/10 text-blue border-blue/20'
    case 'onboarded':
      return 'bg-teal-wash text-teal border-teal/20'
    default:
      return 'bg-amber-50 text-amber-800 border-amber-200'
  }
}

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<CompanyWaitlist[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [detail, setDetail] = useState<CompanyWaitlist | null>(null)
  const [notesDraft, setNotesDraft] = useState('')
  const { toast, showToast, hideToast } = useToast()

  const refresh = useCallback(() => {
    getCompanyWaitlist().then(setEntries)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const stats = useMemo(() => {
    return {
      total: entries.length,
      waitlist: entries.filter((e) => e.status === 'waitlist').length,
      contacted: entries.filter((e) => e.status === 'contacted').length,
      onboarded: entries.filter((e) => e.status === 'onboarded').length,
    }
  }, [entries])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entries.filter((e) => {
      if (
        statusFilter !== 'All' &&
        e.status !== statusFilter.toLowerCase()
      ) {
        return false
      }
      if (!q) return true
      const hay = `${e.company_name} ${e.first_name} ${e.last_name} ${e.email} ${e.project_type}`.toLowerCase()
      return hay.includes(q)
    })
  }, [entries, search, statusFilter])

  async function changeStatus(id: string, status: WaitlistStatus) {
    const { error } = await updateWaitlistStatus(id, status)
    if (error) {
      showToast(error, 'error')
      return
    }
    showToast('Status updated', 'success')
    refresh()
    if (detail?.id === id) {
      setDetail((d) => (d ? { ...d, status } : d))
    }
  }

  async function saveNotes() {
    if (!detail) return
    const { error } = await updateWaitlistStatus(detail.id, detail.status, notesDraft)
    if (error) {
      showToast(error, 'error')
      return
    }
    showToast('Notes saved', 'success')
    refresh()
    setDetail((d) => (d ? { ...d, notes: notesDraft } : d))
  }

  return (
    <AdminShell title="Company Waitlist">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Submissions" value={stats.total} icon={Users} iconColor="text-blue" />
        <StatCard label="Waitlist" value={stats.waitlist} icon={Clock} iconColor="text-amber-500" />
        <StatCard label="Contacted" value={stats.contacted} icon={Building2} iconColor="text-blue" />
        <StatCard label="Onboarded" value={stats.onboarded} icon={UserCheck} iconColor="text-teal" />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <input
            className="w-64 rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {['All', 'Waitlist', 'Contacted', 'Onboarded'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-canvas">
            <tr>
              {[
                'Company',
                'Founder',
                'Project',
                'Skills',
                'Payout',
                'Duration',
                'Submitted',
                'Status',
                'Actions',
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold uppercase text-slate">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold text-navy">{e.company_name}</p>
                  {e.website ? (
                    <a
                      href={e.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue hover:underline"
                    >
                      Website →
                    </a>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <p className="text-navy">
                    {e.first_name} {e.last_name}
                  </p>
                  <p className="text-xs text-slate">{e.email}</p>
                  <p className="text-xs text-slate/60">{e.founder_title}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue/8 px-2 py-0.5 text-xs font-semibold text-blue">
                    {e.project_type}
                  </span>
                  {e.linkedin_url ? (
                    <a
                      href={e.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-xs text-blue"
                    >
                      LinkedIn →
                    </a>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {e.skills.slice(0, 3).map((sk) => (
                      <span
                        key={sk}
                        className="rounded-full bg-canvas px-2 py-0.5 text-xs text-navy"
                      >
                        {sk}
                      </span>
                    ))}
                    {e.skills.length > 3 ? (
                      <span className="text-xs text-slate">+{e.skills.length - 3} more</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate">
                  {e.payout_amount != null
                    ? `$${e.payout_amount.toLocaleString()}`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-slate">{e.sprint_duration}</td>
                <td className="px-4 py-3 text-slate">{formatDate(e.created_at)}</td>
                <td className="px-4 py-3">
                  <select
                    className={`rounded-full border px-2 py-1 text-xs font-semibold capitalize ${statusPillClass(e.status)}`}
                    value={e.status}
                    onChange={(ev) =>
                      changeStatus(e.id, ev.target.value as WaitlistStatus)
                    }
                  >
                    <option value="waitlist">Waitlist</option>
                    <option value="contacted">Contacted</option>
                    <option value="onboarded">Onboarded</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-sm font-semibold text-blue hover:underline"
                    onClick={() => {
                      setDetail(e)
                      setNotesDraft(e.notes ?? '')
                    }}
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-navy">{detail.company_name}</h3>
              <button
                type="button"
                className="text-slate"
                onClick={() => setDetail(null)}
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-sm text-slate">
              {detail.first_name} {detail.last_name} · {detail.email}
            </p>
            <div className="mt-6 space-y-2 text-sm">
              {[
                ['Team size', detail.team_size],
                ['Project', detail.project_type],
                ['Duration', detail.sprint_duration],
                ['Hours/week', detail.hours_per_week],
                ['Reporting to', detail.reporting_to],
                ['Major req', detail.requires_specific_major ? detail.required_major : 'No'],
              ].map(([k, v]) => (
                <p key={String(k)}>
                  <span className="text-slate">{k}: </span>
                  <span className="font-medium text-navy">{v ?? '—'}</span>
                </p>
              ))}
            </div>
            {detail.additional_context ? (
              <div className="mt-4 rounded-xl bg-canvas p-4 text-sm text-navy">
                {detail.additional_context}
              </div>
            ) : null}
            <label className="mt-6 block text-sm font-semibold text-navy">
              Admin notes
            </label>
            <textarea
              rows={4}
              className="mt-2 w-full rounded-xl border border-line px-3 py-2 text-sm"
              value={notesDraft}
              onChange={(ev) => setNotesDraft(ev.target.value)}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveNotes}
                className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white"
              >
                Save notes
              </button>
              <button
                type="button"
                onClick={() => changeStatus(detail.id, 'contacted')}
                className="rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white"
              >
                Mark as Contacted
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Toast {...toast} onHide={hideToast} />
    </AdminShell>
  )
}
