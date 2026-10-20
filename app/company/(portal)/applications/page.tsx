'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { ApplicationCard } from '@/components/company/ApplicationCard'
import { CompanyPortalNav } from '@/components/company/CompanyPortalNav'
import { createClient } from '@/lib/supabase/client'
import { getCompanyApplications } from '@/lib/supabase/applications'
import type { Application, ApplicationStatus } from '@/types/database'

const TABS: Array<{ id: 'all' | ApplicationStatus; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'interview_scheduled', label: 'Scheduled' },
  { id: 'declined', label: 'Declined' },
]

export default function CompanyApplicationsPage() {
  const [userName, setUserName] = useState('')
  const [companyName, setCompanyName] = useState('Your Company')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [tab, setTab] = useState<'all' | ApplicationStatus>('all')
  const [loading, setLoading] = useState(true)

  async function refresh(cid: string) {
    setApplications(await getCompanyApplications(cid))
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: cu } = await supabase
        .from('company_users')
        .select('*, company:companies(*)')
        .eq('id', user.id)
        .maybeSingle()

      setUserName(cu?.full_name ?? 'User')
      if (cu?.company_id) {
        setCompanyId(cu.company_id)
        const co = cu.company as { company_name?: string } | null
        if (co?.company_name) setCompanyName(co.company_name)
        await refresh(cu.company_id)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (tab === 'all') return applications
    return applications.filter((a) => a.status === tab)
  }, [applications, tab])

  const grouped = useMemo(() => {
    const map = new Map<string, Application[]>()
    for (const app of filtered) {
      const key = app.job_posting_id
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(app)
    }
    return map
  }, [filtered])

  const pendingCount = applications.filter((a) => a.status === 'pending').length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue" />
      </div>
    )
  }

  return (
    <>
      <CompanyPortalNav companyName={companyName} userName={userName} />
      <main className="mx-auto max-w-[1280px] px-6 py-10">
        <h1 className="text-2xl font-bold text-navy">Student Applications</h1>
        <p className="mt-1 text-base text-slate">
          {pendingCount} pending review
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
                  : 'border border-line text-slate'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!companyId ? (
          <p className="text-slate">Company profile not linked yet.</p>
        ) : grouped.size === 0 ? (
          <p className="text-slate">No applications yet.</p>
        ) : (
          Array.from(grouped.entries()).map(([jobId, apps]) => {
            const job = apps[0]?.job_posting
            return (
              <section key={jobId} className="mb-10">
                <h2 className="text-lg font-bold text-navy">
                  {job?.role_title ?? 'Role'} at {job?.company_name ?? companyName}
                </h2>
                <p className="text-sm text-slate">
                  {apps.length} application{apps.length === 1 ? '' : 's'}
                </p>
                <div className="mt-4">
                  {apps.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onUpdated={() => companyId && refresh(companyId)}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </main>
    </>
  )
}
