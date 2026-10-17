'use client'

import Link from 'next/link'
import type { ApprovalStatus, JobPosting } from '@/types/database'

function StatusBadge({ status }: { status: ApprovalStatus }) {
  if (status === 'pending') {
    return (
      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        ⏳ Pending Review
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
        ✗ Rejected
      </span>
    )
  }
  return (
    <span className="rounded-full border border-teal/20 bg-teal-wash px-3 py-1 text-xs font-semibold text-teal">
      ✓ Live
    </span>
  )
}

type Props = {
  job: JobPosting
  matchCount?: number
}

export function JobCard({ job, matchCount = 0 }: Props) {
  const status = job.approval_status ?? 'approved'
  const stack = job.tech_stack ?? []
  const visible = stack.slice(0, 4)
  const extra = stack.length - visible.length

  return (
    <div className="mb-4 rounded-2xl border border-line bg-white p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-navy">{job.role_title}</h3>
          <p className="mt-1 text-sm text-slate/60">
            {[job.company_stage, job.role_type].filter(Boolean).join(' · ')}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-canvas px-5 py-3">
        <span className="text-xl font-bold text-navy">
          ${job.payout_amount.toLocaleString()}
        </span>
        <span className="text-sm text-slate">
          / {job.sprint_duration} · {job.hours_per_week}hrs/week
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {visible.map((t) => (
          <span
            key={t}
            className="rounded-full bg-canvas px-3 py-1 text-xs font-medium text-navy"
          >
            {t}
          </span>
        ))}
        {extra > 0 ? (
          <span className="rounded-full bg-canvas px-3 py-1 text-xs text-slate">
            +{extra} more
          </span>
        ) : null}
      </div>

      {status === 'rejected' && job.rejection_reason ? (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Reason: {job.rejection_reason}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm">
          {status === 'approved' ? (
            <span className="font-semibold text-teal">
              ● {matchCount} student matches
            </span>
          ) : null}
          {status === 'pending' ? (
            <span className="italic text-slate/60">
              Under review — usually within 24hrs
            </span>
          ) : null}
          {status === 'rejected' ? (
            <Link
              href={`/company/jobs/${job.id}`}
              className="font-semibold text-blue"
            >
              Resubmit with changes →
            </Link>
          ) : null}
        </div>
        <Link
          href={`/company/jobs/${job.id}`}
          className="text-sm font-semibold text-blue"
        >
          View details →
        </Link>
      </div>
    </div>
  )
}
