'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Briefcase, DollarSign, Plus, Sparkles, Zap } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { JobTable } from '@/components/admin/jobs/JobTable'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { StatCard } from '@/components/ui/StatCard'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import {
  getAllJobPostings,
  getMatchCountsByJob,
  getPendingJobPostings,
  restoreJobPosting,
  softDeleteJobPosting,
  updateJobPosting,
} from '@/lib/supabase/admin'
import type { JobPosting } from '@/types/database'

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [pending, setPending] = useState<JobPosting[]>([])
  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')
  const [listTab, setListTab] = useState<'all' | 'pending'>('all')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    jobId: string | null
  }>({ open: false, jobId: null })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const refresh = useCallback(async () => {
    setJobs(await getAllJobPostings(showDeleted))
    setPending(await getPendingJobPostings())
    setMatchCounts(await getMatchCountsByJob())
  }, [showDeleted])

  useEffect(() => {
    refresh()
  }, [refresh])

  const companies = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.company_name))).sort(),
    [jobs]
  )

  const stats = useMemo(() => {
    const active = jobs.filter((j) => j.is_active)
    const avg =
      jobs.length > 0
        ? Math.round(
            jobs.reduce((s, j) => s + j.payout_amount, 0) / jobs.length
          )
        : 0
    const matches = Object.values(matchCounts).reduce((a, b) => a + b, 0)
    return {
      active: active.length,
      total: jobs.length,
      avg,
      matches,
    }
  }, [jobs, matchCounts])

  async function toggleActive(id: string, active: boolean) {
    await updateJobPosting(id, { is_active: active })
    refresh()
  }

  async function approveJob(id: string) {
    await updateJobPosting(id, {
      approval_status: 'approved',
      is_active: true,
    })
    await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: id }),
    })
    refresh()
  }

  async function rejectJob(id: string) {
    if (!rejectReason.trim()) return
    await updateJobPosting(id, {
      approval_status: 'rejected',
      is_active: false,
      rejection_reason: rejectReason.trim(),
    })
    setRejectingId(null)
    setRejectReason('')
    refresh()
  }

  const tableJobs = listTab === 'pending' ? pending : jobs

  return (
    <AdminShell title="Job Listings">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Jobs"
          value={stats.active}
          icon={Zap}
          iconColor="text-teal"
        />
        <StatCard
          label="Total Jobs"
          value={stats.total}
          icon={Briefcase}
          iconColor="text-blue"
        />
        <StatCard
          label="Avg Payout"
          value={`$${stats.avg.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-navy"
        />
        <StatCard
          label="Total Matches"
          value={stats.matches}
          icon={Sparkles}
          iconColor="text-teal"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setListTab('all')}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            listTab === 'all'
              ? 'bg-navy text-white'
              : 'border border-line bg-white text-slate'
          }`}
        >
          All Jobs
        </button>
        <button
          type="button"
          onClick={() => setListTab('pending')}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            listTab === 'pending'
              ? 'bg-amber-500 text-white'
              : 'border border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          Pending Review ({pending.length})
        </button>
      </div>

      {listTab === 'pending' && pending.length > 0 ? (
        <div className="mb-8 space-y-4">
          {pending.map((job) => {
            const co = job.company
            const founder =
              co?.founder_name ?? co?.contact_name ?? job.lead_engineer_name
            const deck = co?.pitch_deck_url
            return (
            <div
              key={job.id}
              className="rounded-2xl border border-amber-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                    Submitted by founder
                  </span>
                  <p className="mt-2 font-bold text-navy">{job.role_title}</p>
                  <p className="text-sm text-slate">
                    {founder} · {job.company_name} · $
                    {job.payout_amount.toLocaleString()}
                  </p>
                  {deck ? (
                    <a
                      href={deck}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-blue"
                    >
                      View pitch deck →
                    </a>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy"
                  >
                    Edit before approving
                  </Link>
                  <button
                    type="button"
                    onClick={() => approveJob(job.id)}
                    className="rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Approve & Publish ✓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRejectingId(rejectingId === job.id ? null : job.id)
                    }
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                  >
                    Reject ✗
                  </button>
                </div>
              </div>
              {rejectingId === job.id ? (
                <div className="mt-4">
                  <textarea
                    className="w-full rounded-xl border border-line px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Rejection reason for the company..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => rejectJob(job.id)}
                    className="mt-2 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Confirm reject
                  </button>
                </div>
              ) : null}
            </div>
          )})}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="w-64 rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="All">All Companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            {['All', 'Developer', 'Designer', 'Growth', 'Data'].map((r) => (
              <option key={r} value={r}>
                {r === 'All' ? 'All Roles' : r}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            Show deleted listings
          </label>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          Add Job Listing
        </Link>
      </div>

      <JobTable
        jobs={tableJobs}
        matchCounts={matchCounts}
        search={search}
        companyFilter={companyFilter}
        roleFilter={roleFilter}
        onToggleActive={toggleActive}
        onDelete={(job) => setDeleteModal({ open: true, jobId: job.id })}
        onRestore={async (id) => {
          await restoreJobPosting(id)
          showToast('Job listing restored', 'success')
          refresh()
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, jobId: null })}
        onConfirm={async () => {
          if (!deleteModal.jobId) return
          setDeleteLoading(true)
          await softDeleteJobPosting(deleteModal.jobId)
          setDeleteModal({ open: false, jobId: null })
          setDeleteLoading(false)
          showToast('Job listing deleted', 'success')
          refresh()
        }}
        title="Delete this job listing?"
        description="Removes it from student view and stops new matches. Existing match data is preserved."
        isLoading={deleteLoading}
      />

      <Toast {...toast} onHide={hideToast} />
    </AdminShell>
  )
}
