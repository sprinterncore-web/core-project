'use client'

import { motion } from 'framer-motion'
import type { ApplicationStatus, JobPosting, MatchResult } from '@/types/database'
import { ApplicationStatusBadge } from '@/components/student/ApplicationStatusBadge'

type MatchCardProps = {
  match: MatchResult
  index: number
  compact?: boolean
  onApply?: (job: JobPosting) => void
  onViewDetails?: (job: JobPosting) => void
  hasApplied?: boolean
  applicationStatus?: ApplicationStatus
}

export function MatchCard({
  match,
  index,
  compact = false,
  onApply,
  onViewDetails,
  hasApplied = false,
  applicationStatus,
}: MatchCardProps) {
  const job = match.job_posting
  if (!job) return null

  const startsLabel =
    job.starts_in_days === 7
      ? 'Starts next Monday'
      : `🟢 Starts in ${job.starts_in_days} days`

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`mb-4 rounded-2xl border border-line bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${compact ? 'p-4' : 'p-6'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-lg font-bold text-white">
            {job.company_initial}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-navy">
                {job.company_name}
              </span>
              <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-slate">
                {job.company_stage}
              </span>
              <span className="text-xs text-slate/70">
                {job.company_tags.join(' · ')}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate">{job.role_title}</p>
            <p className="text-xs text-slate/60">
              Lead Eng: {job.lead_engineer_name} ({job.lead_engineer_title})
            </p>
          </div>
        </div>

        {match.match_label === 'PENDING MATCH' || match.match_score === 0 ? (
          <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            ⏳ Match Pending
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-teal/20 bg-teal-wash px-3 py-1 text-sm font-bold text-teal">
            ● {match.match_score}% {match.match_label}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-canvas px-5 py-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-bold text-navy">
            ${job.payout_amount.toLocaleString()}
          </span>
          <span className="text-sm text-slate">
            / sprint · {job.sprint_duration} (Approx {job.hours_per_week}
            hrs/week)
          </span>
        </div>
      </div>

      {!compact ? (
        <>
          <p className="mt-5 text-sm font-semibold text-navy">
            Sprint Milestone Objective:
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate">
            {job.milestone_objective}
          </p>
        </>
      ) : (
        <p className="mt-3 line-clamp-2 text-sm text-slate">
          {job.milestone_objective}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {job.tech_stack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-navy"
          >
            {tech}
          </span>
        ))}
      </div>

      {!compact ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {hasApplied && applicationStatus ? (
              <ApplicationStatusBadge status={applicationStatus} />
            ) : onApply ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onApply(job)}
                className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy/90"
              >
                Accept & Schedule Intro (20 min) 📅
              </motion.button>
            ) : null}
            {onViewDetails ? (
              <button
                type="button"
                onClick={() => onViewDetails(job)}
                className="rounded-full border border-line px-5 py-2.5 text-sm text-navy transition-all hover:border-navy"
              >
                View Full Sprint Scope
              </button>
            ) : null}
          </div>
          <span className="text-sm font-semibold text-teal">{startsLabel}</span>
        </div>
      ) : null}
    </motion.article>
  )
}
