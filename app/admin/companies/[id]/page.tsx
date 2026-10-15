'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { CompanyForm } from '@/components/admin/companies/CompanyForm'
import {
  getAllJobPostings,
  updateCompany,
} from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/client'
import type { Company, JobPosting } from '@/types/database'

export default function EditCompanyPage() {
  const params = useParams()
  const id = String(params.id)
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()
      setCompany(data as Company)
      const all = await getAllJobPostings()
      setJobs(all.filter((j) => j.company_id === id))
    }
    load()
  }, [id])

  if (!company) {
    return (
      <AdminShell title="Edit Company">
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-teal" />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Edit Company">
      <Link
        href="/admin/companies"
        className="text-sm font-medium text-blue hover:underline"
      >
        ← Back to Companies
      </Link>
      <div className="mt-6">
        <CompanyForm
          initial={company}
          submitLabel="Save Changes →"
          error={error}
          onSubmit={async (values) => {
            const { error: err } = await updateCompany(id, values)
            if (err) {
              setError(err)
              return
            }
            setError(null)
          }}
        />
      </div>

      <section className="mt-12 rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-navy">Job Listings</h3>
          <Link
            href={`/admin/jobs/new?company=${id}`}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy hover:border-navy"
          >
            <Plus size={16} />
            Add Job for this Company
          </Link>
        </div>
        {jobs.length === 0 ? (
          <p className="mt-4 text-sm text-slate">No jobs linked yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {jobs.map((j) => (
              <li key={j.id}>
                <Link
                  href={`/admin/jobs/${j.id}`}
                  className="text-sm font-medium text-blue hover:underline"
                >
                  {j.role_title} · ${j.payout_amount.toLocaleString()}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  )
}
