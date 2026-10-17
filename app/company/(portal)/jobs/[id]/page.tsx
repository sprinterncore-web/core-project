'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { JobPostingForm } from '@/components/company/JobPostingForm'
import { CompanyPortalNav } from '@/components/company/CompanyPortalNav'
import { createClient } from '@/lib/supabase/client'
import {
  getCompanyById,
  getCompanyUser,
  getJobMatchesWithProfiles,
  getJobPostingById,
  updateCompanyJobPosting,
} from '@/lib/supabase/company'
import type { ApprovalStatus, Company, JobPosting } from '@/types/database'

export default function CompanyJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = String(params.id)
  const [job, setJob] = useState<JobPosting | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [userName, setUserName] = useState('')
  const [matches, setMatches] = useState<
    Awaited<ReturnType<typeof getJobMatchesWithProfiles>>
  >([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const cu = await getCompanyUser(user.id)
      setUserName(cu?.full_name ?? 'User')
      const posting = await getJobPostingById(jobId)
      if (!posting || !cu?.company_id || posting.company_id !== cu.company_id) {
        router.replace('/company/jobs')
        return
      }
      setJob(posting)
      setCompany(await getCompanyById(cu.company_id))
      if (posting.approval_status === 'approved') {
        setMatches(await getJobMatchesWithProfiles(jobId))
      }
    }
    load()
  }, [jobId, router])

  if (!job || !company) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue border-t-transparent" />
      </div>
    )
  }

  const status = (job.approval_status ?? 'approved') as ApprovalStatus
  const editable = status === 'pending' || status === 'rejected'

  function StatusPill({ large }: { large?: boolean }) {
    const base = large ? 'text-sm px-4 py-2' : 'text-xs px-3 py-1'
    if (status === 'pending') {
      return (
        <span
          className={`rounded-full border border-amber-200 bg-amber-50 font-semibold text-amber-700 ${base}`}
        >
          ⏳ Under Review
        </span>
      )
    }
    if (status === 'rejected') {
      return (
        <span
          className={`rounded-full border border-red-200 bg-red-50 font-semibold text-red-600 ${base}`}
        >
          ✗ Not Approved
        </span>
      )
    }
    return (
      <span
        className={`rounded-full border border-teal/20 bg-teal-wash font-semibold text-teal ${base}`}
      >
        ✓ Live
      </span>
    )
  }

  return (
    <>
      <CompanyPortalNav
        companyName={company.company_name}
        userName={userName}
      />
      <main className="mx-auto max-w-[1280px] px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/company/jobs"
            className="text-sm font-medium text-blue hover:underline"
          >
            ← Back to Listings
          </Link>
          <StatusPill large />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-line bg-white p-7">
              {editable ? (
                <JobPostingForm
                  initialData={job}
                  companyId={company.id}
                  companyName={company.company_name}
                  companyInitial={company.company_initial}
                  companyStage={company.stage}
                  isLoading={loading}
                  submitLabel="Save & Resubmit"
                  cancelHref={`/company/jobs/${job.id}`}
                  onSubmit={async (data) => {
                    setLoading(true)
                    const { error } = await updateCompanyJobPosting(job.id, data)
                    setLoading(false)
                    if (!error) router.push('/company/jobs')
                  }}
                />
              ) : (
                <div className="space-y-4 text-sm">
                  <h2 className="text-2xl font-bold text-navy">{job.role_title}</h2>
                  <p className="text-slate">
                    {job.lead_engineer_name} · {job.lead_engineer_title}
                  </p>
                  <p>
                    <span className="font-semibold text-navy">
                      ${job.payout_amount.toLocaleString()}
                    </span>{' '}
                    · {job.sprint_duration} · {job.hours_per_week} hrs/week
                  </p>
                  <p className="text-slate">{job.milestone_objective}</p>
                  <div className="flex flex-wrap gap-2">
                    {job.tech_stack.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-canvas px-3 py-1 text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-white p-7">
              <h3 className="mb-5 text-xl font-bold text-navy">
                Matched Students
              </h3>
              {status !== 'approved' ? (
                <p className="text-sm italic text-slate">
                  Students will be matched once your listing is approved.
                </p>
              ) : matches.length === 0 ? (
                <p className="text-sm text-slate">No matches yet.</p>
              ) : (
                matches.map((m) => {
                  const p = m.profile as {
                    full_name?: string
                    university?: string
                    major?: string
                    graduation_year?: number
                  } | null
                  const name = p?.full_name ?? 'Student'
                  const initials = name
                    .split(' ')
                    .map((x) => x[0])
                    .join('')
                    .slice(0, 2)
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between border-b border-line py-4 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                          {initials}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-navy">
                            {name}
                          </p>
                          <p className="text-xs text-slate">
                            {[p?.university, p?.major, p?.graduation_year]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-teal-wash px-3 py-1 text-xs font-bold text-teal">
                          {m.match_score}% {m.match_label}
                        </span>
                        <Link
                          href="/book"
                          className="rounded-full bg-teal px-4 py-2 text-xs font-semibold text-white"
                        >
                          Accept & Schedule Intro →
                        </Link>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <StatusPill large />
              {status === 'pending' ? (
                <p className="mt-3 text-sm text-slate">
                  Our team reviews listings within 24 hours. You&apos;ll receive
                  an email when it&apos;s approved.
                </p>
              ) : null}
              {status === 'approved' ? (
                <div className="mt-3 space-y-1 text-sm text-slate">
                  <p>Starts in {job.starts_in_days} days</p>
                  <p>Matched with {matches.length} students</p>
                </div>
              ) : null}
              {status === 'rejected' && job.rejection_reason ? (
                <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {job.rejection_reason}
                </div>
              ) : null}
              {status === 'rejected' ? (
                <p className="mt-3 text-sm text-blue">
                  Edit the form and resubmit for review.
                </p>
              ) : null}
            </div>
            <div className="mt-4 rounded-2xl border border-line bg-white p-6">
              <h4 className="font-bold text-navy">Need help?</h4>
              <p className="mt-2 text-sm text-slate">
                Contact our team to adjust this listing or discuss your sprint
                requirements.
              </p>
              <a
                href="mailto:hello@sprintern.co"
                className="mt-4 block text-sm font-semibold text-blue"
              >
                hello@sprintern.co
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
