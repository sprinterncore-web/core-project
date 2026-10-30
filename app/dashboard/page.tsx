'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarCheck, Loader2 } from 'lucide-react'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { MatchCard } from '@/components/dashboard/MatchCard'
import { MatchSidebar } from '@/components/dashboard/MatchSidebar'
import { ApplyModal } from '@/components/student/ApplyModal'
import { InterviewCard } from '@/components/student/InterviewCard'
import { JobDetailModal } from '@/components/student/JobDetailModal'
import { createClient } from '@/lib/supabase/client'
import { WAITLIST_PROFILE_URL } from '@/lib/portal-access'
import { isTestingMode } from '@/lib/testing'
import {
  getScheduledInterviews,
  getStudentApplications,
} from '@/lib/supabase/applications'
import { getProfile } from '@/lib/supabase/profile'
import { getMatchesForStudent } from '@/lib/supabase/matches'
import type { Application, JobPosting, MatchResult, Profile } from '@/types/database'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [applyModal, setApplyModal] = useState<{
    open: boolean
    job: JobPosting | null
  }>({ open: false, job: null })
  const [detailModal, setDetailModal] = useState<{
    open: boolean
    job: JobPosting | null
    matchScore?: number
    matchLabel?: string
  }>({ open: false, job: null })
  const [applications, setApplications] = useState<Application[]>([])
  const [interviews, setInterviews] = useState<Application[]>([])

  async function refreshApplications(studentId: string) {
    setApplications(await getStudentApplications(studentId))
    setInterviews(await getScheduledInterviews(studentId))
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) {
        router.replace('/auth/login')
        return
      }

      if (!isTestingMode() && !authUser.email_confirmed_at) {
        await supabase.auth.signOut()
        router.replace('/auth/login?error=email_not_confirmed')
        return
      }

      setUser(authUser)
      const prof = await getProfile(authUser.id)
      setProfile(prof)

      if (prof && prof.portal_access === false && !isTestingMode()) {
        router.replace(WAITLIST_PROFILE_URL)
        return
      }

      const step = prof?.onboarding_step ?? 0
      const complete = prof?.onboarding_complete ?? false
      if (!complete && step < 4) {
        router.replace(`/onboarding/step/${Math.max(1, step + 1)}`)
        return
      }
      const matchList = await getMatchesForStudent(authUser.id)
      setMatches(matchList)
      await refreshApplications(authUser.id)
      setLoading(false)
    }
    load()
  }, [router])

  const appliedJobIds = useMemo(
    () => new Set(applications.map((a) => a.job_posting_id)),
    [applications]
  )
  const applicationsByJob = useMemo(
    () => Object.fromEntries(applications.map((a) => [a.job_posting_id, a])),
    [applications]
  )

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase()
    if (!q) return matches
    return matches.filter((m) => {
      const job = m.job_posting
      if (!job) return false
      const inStack = job.tech_stack.some((t) => t.toLowerCase().includes(q))
      const inCompany = job.company_name.toLowerCase().includes(q)
      return inStack || inCompany
    })
  }, [matches, searchValue])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={40} className="animate-spin text-teal" />
      </div>
    )
  }

  return (
    <>
      <DashboardNav
        userEmail={user?.email ?? ''}
        userName={profile?.full_name ?? null}
      />

      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy">
            Your Curated Engineering Sprint Matches
          </h1>
          <p className="mt-2 text-base text-slate">
            Based on your verified stack and {profile?.hours_per_week ?? 15}
            hrs/week availability. Matched with high-growth venture-backed teams
            ready to kick off this week.
          </p>
        </div>

        <FilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterChange={() => {}}
          onSortChange={() => {}}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-slate">
                No matches found for &apos;{searchValue}&apos;
              </p>
            ) : (
              filtered.map((match, i) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  index={i}
                  onApply={(job) => setApplyModal({ open: true, job })}
                  onViewDetails={(job) =>
                    setDetailModal({
                      open: true,
                      job,
                      matchScore: match.match_score,
                      matchLabel: match.match_label,
                    })
                  }
                  hasApplied={appliedJobIds.has(match.job_posting_id)}
                  applicationStatus={
                    applicationsByJob[match.job_posting_id]?.status
                  }
                />
              ))
            )}

            {interviews.length > 0 ? (
              <section className="mt-12">
                <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-navy">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue/10">
                    <CalendarCheck size={18} className="text-blue" />
                  </span>
                  Scheduled Interviews
                </h2>
                <div className="flex flex-col gap-4">
                  {interviews.map((interview) => (
                    <InterviewCard key={interview.id} application={interview} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <MatchSidebar profile={profile} matchCount={matches.length} />
          </div>
        </div>
      </main>

      <JobDetailModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, job: null })}
        job={detailModal.job}
        matchScore={detailModal.matchScore}
        matchLabel={detailModal.matchLabel}
        onApply={() => {
          const job = detailModal.job
          setDetailModal({ open: false, job: null })
          if (job) setApplyModal({ open: true, job })
        }}
        hasApplied={
          detailModal.job ? appliedJobIds.has(detailModal.job.id) : false
        }
      />

      <ApplyModal
        isOpen={applyModal.open}
        onClose={() => setApplyModal({ open: false, job: null })}
        job={applyModal.job}
        studentId={user?.id ?? ''}
        onSuccess={() => {
          if (user) refreshApplications(user.id)
          setApplyModal({ open: false, job: null })
        }}
      />

      <footer className="mt-16 border-t border-line pb-6 pt-8">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6">
          <div>
            <p className="text-sm font-bold text-navy">Sprintern</p>
            <p className="mt-1 text-xs text-slate/50">
              © 2025 Sprintern. Powered by AI Sprint Match Engine.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-slate/50">
            {[
              'Privacy Policy',
              'Terms of Service',
              'Support & FAQs',
              'Sprint Cohort Guidelines',
            ].map((label) => (
              <button
                key={label}
                type="button"
                className="transition-colors hover:text-slate"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
