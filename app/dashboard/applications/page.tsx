'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus, Loader2 } from 'lucide-react'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { ApplicationStatusBadge } from '@/components/student/ApplicationStatusBadge'
import { createClient } from '@/lib/supabase/client'
import {
  formatDate,
  formatInterviewDateTime,
  formatSlotShort,
  toGoogleCalendarDates,
} from '@/lib/format'
import { getProfile } from '@/lib/supabase/profile'
import {
  getStudentApplications,
  withdrawApplication,
} from '@/lib/supabase/applications'
import type { Application, ApplicationStatus, Profile } from '@/types/database'

const TABS: Array<{ id: 'all' | ApplicationStatus; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'interview_scheduled', label: 'Interview Scheduled' },
  { id: 'declined', label: 'Declined' },
]

export default function StudentApplicationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [applications, setApplications] = useState<Application[]>([])
  const [tab, setTab] = useState<'all' | ApplicationStatus>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }
      setEmail(user.email ?? '')
      setProfile(await getProfile(user.id))
      setApplications(await getStudentApplications(user.id))
      setLoading(false)
    }
    load()
  }, [router])

  const filtered = useMemo(() => {
    if (tab === 'all') return applications
    return applications.filter((a) => a.status === tab)
  }, [applications, tab])

  const stats = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((a) => a.status === 'pending').length,
      scheduled: applications.filter(
        (a) => a.status === 'interview_scheduled'
      ).length,
    }),
    [applications]
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={40} className="animate-spin text-teal" />
      </div>
    )
  }

  return (
    <>
      <DashboardNav userEmail={email} userName={profile?.full_name ?? null} />
      <main className="mx-auto max-w-[1280px] px-6 py-10">
        <h1 className="text-3xl font-bold text-navy">My Applications</h1>
        <p className="mt-2 text-base text-slate">
          {stats.total} total · {stats.pending} pending · {stats.scheduled}{' '}
          interviews
        </p>

        <div className="mb-8 mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === t.id
                  ? 'bg-navy text-white'
                  : 'border border-line text-slate hover:border-navy'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-slate">No applications yet.</p>
        ) : (
          filtered.map((app) => {
            const job = app.job_posting
            const slots = [
              app.proposed_slot_1,
              app.proposed_slot_2,
              app.proposed_slot_3,
            ].filter(Boolean) as string[]

            return (
              <div
                key={app.id}
                className="mb-4 rounded-2xl border border-line bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-navy">
                      {job?.company_name ?? 'Company'} · {job?.role_title}
                    </p>
                    <p className="text-xs text-slate/50">
                      Submitted {formatDate(app.created_at)}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wider text-slate/60">
                    Your pitch
                  </p>
                  <p className="mt-1 text-sm italic text-slate">
                    {app.pitch.length > 200
                      ? `${app.pitch.slice(0, 200)}...`
                      : app.pitch}
                  </p>
                </div>

                {app.status === 'pending' && slots.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wider text-slate/60">
                      Proposed times
                    </p>
                    <ul className="mt-2 space-y-1">
                      {slots.map((s) => (
                        <li key={s} className="text-sm text-navy">
                          {formatSlotShort(s)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {app.status === 'interview_scheduled' && app.confirmed_slot ? (
                  <div className="mt-4 rounded-xl border border-blue/15 bg-blue/5 px-5 py-4">
                    {(() => {
                      const { dateStr, timeStr, endTimeStr } =
                        formatInterviewDateTime(app.confirmed_slot)
                      const { start, end } = toGoogleCalendarDates(
                        app.confirmed_slot
                      )
                      const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                        `Sprint Interview - ${job?.company_name ?? 'Company'}`
                      )}&dates=${start}/${end}`
                      return (
                        <>
                          <p className="font-semibold text-blue">
                            {dateStr} · {timeStr} – {endTimeStr}
                          </p>
                          <button
                            type="button"
                            onClick={() => window.open(gcal, '_blank')}
                            className="mt-3 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-slate hover:border-blue hover:text-blue"
                          >
                            <CalendarPlus size={15} />
                            Add to Calendar
                          </button>
                        </>
                      )
                    })()}
                  </div>
                ) : null}

                {app.status === 'declined' && app.decline_reason ? (
                  <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm italic text-red-700">
                    Feedback: {app.decline_reason}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  {app.resume_link ? (
                    <p className="text-sm text-slate">
                      Resume:{' '}
                      <a
                        href={app.resume_link}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue hover:underline"
                      >
                        View on Drive →
                      </a>
                    </p>
                  ) : (
                    <span />
                  )}
                  {app.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await withdrawApplication(app.id)
                        setApplications((prev) =>
                          prev.filter((a) => a.id !== app.id)
                        )
                      }}
                      className="cursor-pointer text-xs text-red-500 hover:underline"
                    >
                      Withdraw application
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })
        )}
      </main>
    </>
  )
}
