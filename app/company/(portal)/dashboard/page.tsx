'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Calendar,
  Clock,
  Mail,
  Plus,
  Sparkles,
} from 'lucide-react'
import { CompanyPortalNav } from '@/components/company/CompanyPortalNav'
import { JobCard } from '@/components/company/JobCard'
import { createClient } from '@/lib/supabase/client'
import {
  getCompanyById,
  getCompanyJobPostings,
  getCompanyUser,
  getMatchCountsByJobIds,
} from '@/lib/supabase/company'
import type { Company, JobPosting } from '@/types/database'

export default function CompanyDashboardPage() {
  const [userName, setUserName] = useState('')
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const cu = await getCompanyUser(user.id)
      setUserName(cu?.full_name ?? user.email ?? 'User')

      if (cu?.company_id) {
        const co = await getCompanyById(cu.company_id)
        setCompany(co)
        const list = await getCompanyJobPostings(cu.company_id)
        setJobs(list)
        setMatchCounts(await getMatchCountsByJobIds(list.map((j) => j.id)))
      }
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const approved = jobs.filter(
      (j) => j.approval_status === 'approved' && j.is_active
    )
    const pending = jobs.filter((j) => j.approval_status === 'pending')
    const matches = Object.values(matchCounts).reduce((a, b) => a + b, 0)
    return {
      active: approved.length,
      pending: pending.length,
      matches,
    }
  }, [jobs, matchCounts])

  const firstName = userName.split(' ')[0] ?? userName
  const recent = jobs.slice(0, 3)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue border-t-transparent" />
      </div>
    )
  }

  const displayCompany = company?.company_name ?? 'Your Company'

  return (
    <>
      <CompanyPortalNav companyName={displayCompany} userName={userName} />
      <main className="mx-auto max-w-[1280px] px-6 py-10">
        {!company ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-line bg-white p-12 text-center">
            <Clock size={48} className="mx-auto text-slate/40" />
            <h2 className="mt-6 text-2xl font-bold text-navy">
              Account pending setup
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-slate">
              Our team is setting up your company profile after your intro call.
              You&apos;ll have full access to your sprint dashboard and matched
              student profiles within 24 hours.
            </p>
            <Link
              href="/book"
              className="mt-8 inline-block rounded-full bg-blue px-8 py-3.5 font-semibold text-white hover:bg-blue/90"
            >
              Book your intro call
            </Link>
            <div className="mt-8 rounded-xl bg-canvas p-5 text-left">
              {[
                'Confirm your email',
                '20-min intro call with our team',
                'Company profile linked to your account',
                'Post sprint roles & receive matches',
              ].map((step, i) => (
                <div key={step} className="mt-2 flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm text-navy">{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-navy">
                  Welcome back, {firstName}
                </h1>
                <p className="mt-1 text-base text-slate">
                  {company.company_name} · {company.stage}
                </p>
              </div>
              <Link
                href="/company/jobs/new"
                className="inline-flex items-center gap-2 rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white hover:bg-blue/90"
              >
                <Plus size={16} />
                Post a Sprint Role
              </Link>
            </div>

            <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-line bg-white p-6">
                <Briefcase className="text-blue" size={22} />
                <p className="mt-3 text-3xl font-bold text-navy">
                  {stats.active}
                </p>
                <p className="mt-1 text-sm text-slate">Active Listings</p>
              </div>
              <div
                className={`rounded-2xl border bg-white p-6 ${
                  stats.pending > 0 ? 'border-amber-300' : 'border-line'
                }`}
              >
                <Clock className="text-amber-500" size={22} />
                <p className="mt-3 text-3xl font-bold text-navy">
                  {stats.pending}
                </p>
                <p className="mt-1 text-sm text-slate">Pending Review</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-6">
                <Sparkles className="text-teal" size={22} />
                <p className="mt-3 text-3xl font-bold text-navy">
                  {stats.matches}
                </p>
                <p className="mt-1 text-sm text-slate">Total Matches</p>
              </div>
            </div>

            <div className="mb-10">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-navy">
                  Your Sprint Listings
                </h2>
                <Link href="/company/jobs" className="text-sm text-blue">
                  View all →
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-line bg-white p-10 text-center">
                  <Briefcase size={32} className="mx-auto text-slate/30" />
                  <p className="mt-4 text-lg font-semibold text-slate">
                    No listings yet
                  </p>
                  <p className="mt-2 text-sm text-slate/60">
                    Post your first sprint role and our team will match you with
                    the right student builders.
                  </p>
                  <Link
                    href="/company/jobs/new"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white"
                  >
                    <Plus size={16} />
                    Post First Sprint Role
                  </Link>
                </div>
              ) : (
                recent.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    matchCount={matchCounts[job.id] ?? 0}
                  />
                ))
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-gradient-to-br from-navy to-[#0D1F3C] p-7">
                <Calendar className="mb-4 h-10 w-10 rounded-xl bg-teal/15 p-2 text-teal" />
                <h3 className="text-lg font-bold text-white">
                  Book another call
                </h3>
                <p className="mt-2 text-sm text-white/60">
                  Need to discuss a new sprint scope or adjust requirements?
                </p>
                <Link
                  href="/book"
                  className="mt-5 inline-block rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Schedule 20-min call →
                </Link>
              </div>
              <div className="rounded-2xl border border-line bg-white p-7">
                <Mail className="mb-4 h-10 w-10 rounded-xl bg-blue/10 p-2 text-blue" />
                <h3 className="text-lg font-bold text-navy">Contact our team</h3>
                <p className="mt-2 text-sm text-slate">
                  Questions about your matches or sprint scope?
                </p>
                <a
                  href="mailto:hello@sprintern.co"
                  className="mt-5 block text-sm font-semibold text-blue"
                >
                  hello@sprintern.co →
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}
