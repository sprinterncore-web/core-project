'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { JobForm } from '@/components/admin/jobs/JobForm'
import { createJobPosting, getAllCompanies } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/client'
import type { Company } from '@/types/database'

function NewJobForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultCompany = searchParams.get('company') ?? undefined
  const [companies, setCompanies] = useState<Company[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAllCompanies().then(setCompanies)
  }, [])

  return (
    <>
      <Link
        href="/admin/jobs"
        className="text-sm font-medium text-blue hover:underline"
      >
        ← Back to Jobs
      </Link>
      <div className="mt-6">
        <JobForm
          companies={companies}
          defaultCompanyId={defaultCompany}
          submitLabel="Publish Job Listing →"
          error={error}
          onSubmit={async (values) => {
            const supabase = createClient()
            const {
              data: { user },
            } = await supabase.auth.getUser()
            const { id, error: err } = await createJobPosting({
              ...values,
              created_by: user?.id ?? null,
            })
            if (err || !id) {
              setError(err ?? 'Failed to create job')
              return
            }
            router.push('/admin/jobs')
          }}
        />
      </div>
    </>
  )
}

export default function NewJobPage() {
  return (
    <AdminShell title="Add Job Listing">
      <Suspense fallback={<p className="text-slate">Loading…</p>}>
        <NewJobForm />
      </Suspense>
    </AdminShell>
  )
}
