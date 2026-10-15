'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Briefcase, DollarSign, Plus, Sparkles, Zap } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { JobTable } from '@/components/admin/jobs/JobTable'
import { StatCard } from '@/components/ui/StatCard'
import {
  deleteJobPosting,
  getAllJobPostings,
  getMatchCountsByJob,
  updateJobPosting,
} from '@/lib/supabase/admin'
import type { JobPosting } from '@/types/database'

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')

  async function refresh() {
    setJobs(await getAllJobPostings())
    setMatchCounts(await getMatchCountsByJob())
  }

  useEffect(() => {
    refresh()
  }, [])

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

  async function deactivate(id: string) {
    await deleteJobPosting(id)
    refresh()
  }

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
        jobs={jobs}
        matchCounts={matchCounts}
        search={search}
        companyFilter={companyFilter}
        roleFilter={roleFilter}
        onToggleActive={toggleActive}
        onDeactivate={deactivate}
      />
    </AdminShell>
  )
}
