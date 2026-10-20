'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApplicationCard } from '@/components/company/ApplicationCard'
import { CompanyPortalNav } from '@/components/company/CompanyPortalNav'
import { createClient } from '@/lib/supabase/client'
import { getCompanyApplications } from '@/lib/supabase/applications'
import type {
  Application,
  ApplicationStatus,
  Company,
  CompanyUser,
} from '@/types/database'

const TABS: Array<{ id: 'all' | ApplicationStatus; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'interview_scheduled', label: 'Scheduled' },
  { id: 'declined', label: 'Declined' },
]

type CompanyUserWithCompany = CompanyUser & { company?: Company | null }

export default function CompanyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | ApplicationStatus>('all')

  const refresh = useCallback(async (companyId: string) => {
    setApplications(await getCompanyApplications(companyId))
  }, [])

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: cu, error: cuError } = await supabase
        .from('company_users')
        .select('*, company:companies(*)')
        .eq('id', user.id)
        .single()

      if (cuError) {
        console.error('Error loading company user:', cuError.message)
        setLoading(false)
        return
      }

      if (!cu) {
        setLoading(false)
        return
      }

      const row = cu as CompanyUserWithCompany
      setCompanyUser(row)
      setCompany(row.company ?? null)

      if (row.company_id) {
        const apps = await getCompanyApplications(row.company_id)
        setApplications(apps)
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
  const companyName = company?.company_name ?? 'Your Company'
  const userName = companyUser?.full_name ?? 'User'
  const companyId = companyUser?.company_id ?? null

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
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

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 font-mono text-xs">
            <p>company_id: {companyUser?.company_id ?? 'null'}</p>
            <p>applications count: {applications.length}</p>
          </div>
        )}

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
                  {job?.role_title ?? 'Role'} at{' '}
                  {job?.company_name ?? companyName}
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
