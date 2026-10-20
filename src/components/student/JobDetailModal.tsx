'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { JobPosting } from '@/types/database'

type Props = {
  isOpen: boolean
  onClose: () => void
  job: JobPosting | null
  onApply: () => void
  hasApplied: boolean
  matchScore?: number
  matchLabel?: string
}

export function JobDetailModal({
  isOpen,
  onClose,
  job,
  onApply,
  hasApplied,
  matchScore = 0,
  matchLabel,
}: Props) {
  if (!job) return null

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2 }}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-7 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-lg font-bold text-white">
                    {job.company_initial}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-navy">
                      {job.company_name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-slate">
                        {job.company_stage}
                      </span>
                      {job.company_tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs text-slate/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button type="button" onClick={onClose} aria-label="Close">
                  <X size={20} className="text-slate hover:text-navy" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-7 py-6">
                <section>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate/50">
                    Role
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-navy">
                    {job.role_title}
                  </h2>
                  <p className="mt-1 text-sm text-slate">
                    Lead Eng: {job.lead_engineer_name} (
                    {job.lead_engineer_title})
                  </p>
                </section>

                <section className="flex items-center justify-between rounded-2xl bg-canvas px-6 py-5">
                  <div>
                    <p className="text-3xl font-bold text-navy">
                      ${job.payout_amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate">/ {job.sprint_duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-navy">
                      {job.hours_per_week} hrs/week
                    </p>
                    <p className="mt-0.5 text-sm text-teal">
                      Starts in {job.starts_in_days} days
                    </p>
                  </div>
                </section>

                <section>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate/50">
                    Sprint milestone objective
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-navy">
                    {job.milestone_objective}
                  </p>
                </section>

                <section>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate/50">
                    Required stack
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-navy"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate/50">
                    About the company
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {[
                      ['Stage', job.company_stage],
                      ['Company tags', job.company_tags.join(', ')],
                      ['Sprint duration', job.sprint_duration],
                      ['Hours/week', `${job.hours_per_week} hrs`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-canvas p-4">
                        <p className="text-xs uppercase tracking-wider text-slate/60">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-navy">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {matchScore > 0 && matchLabel ? (
                  <section className="flex items-center justify-between rounded-2xl border border-teal/20 bg-teal-wash p-5">
                    <p className="text-sm font-semibold text-navy">
                      Your stack match
                    </p>
                    <p className="text-lg font-bold text-teal">
                      {matchScore}% {matchLabel}
                    </p>
                  </section>
                ) : null}
              </div>

              <div className="sticky bottom-0 flex gap-3 border-t border-line bg-white px-7 py-5">
                {hasApplied ? (
                  <div className="w-full rounded-full border border-teal/20 bg-teal-wash py-3.5 text-center text-sm font-semibold text-teal">
                    ✓ Applied — Awaiting Review
                  </div>
                ) : (
                  <>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        onClose()
                        onApply()
                      }}
                      className="flex-1 rounded-full bg-navy py-3.5 text-sm font-bold text-white transition-all hover:bg-navy/90"
                    >
                      Apply & Propose Interview Times →
                    </motion.button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-line px-6 py-3.5 text-sm text-slate transition-all hover:border-navy hover:text-navy"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
