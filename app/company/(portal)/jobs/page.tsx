'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { CompanyPortalNav } from '@/components/company/CompanyPortalNav'
import { JobCard } from '@/components/company/JobCard'
import { createClient } from '@/lib/supabase/client'
import {
  getCompanyById,
  getCompanyJobPostings,
  getCompanyUser,
  getMatchCountsByJobIds,
} from '@/lib/supabase/company'
import type { JobPosting } from '@/types/database'

type Tab = 'all' | 'live' | 'pending' | 'rejected'

export default function CompanyJobsPage() {
  const [userName, setUserName] = useState('')
  const [companyName, setCompanyName] = useState('Your Company')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({})
  const [tab, setTab] = useState<Tab>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const cu = await getCompanyUser(user.id)
      setUserName(cu?.full_name ?? 'User')
      if (!cu?.company_id) return
      setCompanyId(cu.company_id)
      const co = await getCompanyById(cu.company_id)
      if (co) setCompanyName(co.company_name)
      const list = await getCompanyJobPostings(cu.company_id)
      setJobs(list)
      setMatchCounts(await getMatchCountsByJobIds(list.map((j) => j.id)))
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const status = j.approval_status ?? 'approved'
      if (tab === 'all') return true
      if (tab === 'live') return status === 'approved' && j.is_active
      if (tab === 'pending') return status === 'pending'
      if (tab === 'rejected') return status === 'rejected'
      return true
    })
  }, [jobs, tab])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'live', label: 'Live' },
    { id: 'pending', label: 'Pending Review' },
    { id: 'rejected', label: 'Rejected' },
  ]

  return (
    <>
      <CompanyPortalNav companyName={companyName} userName={userName} />
      <main className="mx-auto max-w-[1280px] px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-navy">Sprint Listings</h1>
          {companyId ? (
            <Link
              href="/company/jobs/new"
              className="inline-flex items-center gap-2 rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Post New Role
            </Link>
          ) : null}
        </div>

        {!companyId ? (
          <p className="text-slate">
            Your company profile is still being set up. You can post roles once
            an admin links your account.
          </p>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    tab === t.id
                      ? 'bg-navy text-white'
                      : 'border border-line bg-white text-slate'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-line bg-white p-10 text-center">
                <p className="text-slate">No listings in this tab.</p>
              </div>
            ) : (
              filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  matchCount={matchCounts[job.id] ?? 0}
                />
              ))
            )}
          </>
        )}
      </main>
    </>
  )
}
