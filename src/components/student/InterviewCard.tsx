'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarPlus } from 'lucide-react'
import {
  formatInterviewDateTime,
  interviewCountdown,
  toGoogleCalendarDates,
} from '@/lib/format'
import type { Application } from '@/types/database'

export function InterviewCard({ application }: { application: Application }) {
  const job = application.job_posting
  const slot = application.confirmed_slot
  if (!job || !slot) return null

  const { dateStr, timeStr, endTimeStr } = formatInterviewDateTime(slot)
  const { start, end } = toGoogleCalendarDates(slot)
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Sprint Interview - ${job.company_name}`
  )}&dates=${start}/${end}&details=${encodeURIComponent(application.pitch)}`

  const pitchPreview =
    application.pitch.length > 150
      ? `${application.pitch.slice(0, 150)}...`
      : application.pitch

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-blue/20 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-lg font-bold text-white">
            {job.company_initial}
          </div>
          <div>
            <p className="text-lg font-bold text-navy">{job.company_name}</p>
            <p className="mt-0.5 text-sm text-slate">{job.role_title}</p>
          </div>
        </div>
        <span className="rounded-full border border-blue/20 bg-blue/10 px-3 py-1.5 text-xs font-bold text-blue">
          📅 Interview Scheduled
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-blue/15 bg-blue/5 px-6 py-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue/70">
          Confirmed interview time
        </p>
        <p className="mt-2 text-xl font-bold text-navy">{dateStr}</p>
        <p className="mt-1 text-base text-navy">
          {timeStr} – {endTimeStr} (30 min)
        </p>
        <p className="mt-3 text-sm font-semibold text-blue">
          {interviewCountdown(slot)}
        </p>
      </div>

      <div className="mt-5 rounded-xl bg-canvas px-5 py-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-slate/50">
          Your pitch
        </p>
        <p className="text-sm italic leading-relaxed text-slate">
          {pitchPreview}
        </p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => window.open(gcalUrl, '_blank')}
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-slate transition-all hover:border-blue hover:text-blue"
        >
          <CalendarPlus size={15} />
          Add to Calendar
        </button>
        <Link
          href="/dashboard/applications"
          className="self-center text-sm font-semibold text-blue hover:underline"
        >
          View Application
        </Link>
      </div>
    </motion.div>
  )
}
