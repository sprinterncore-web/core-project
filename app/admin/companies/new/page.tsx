'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { CompanyForm } from '@/components/admin/companies/CompanyForm'
import { createCompany } from '@/lib/supabase/admin'

export default function NewCompanyPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  return (
    <AdminShell title="Add Company">
      <Link
        href="/admin/companies"
        className="text-sm font-medium text-blue hover:underline"
      >
        ← Back to Companies
      </Link>
      <div className="mt-6">
        <CompanyForm
          submitLabel="Add Company →"
          error={error}
          onSubmit={async (values) => {
            const { id, error: err } = await createCompany(values)
            if (err || !id) {
              setError(err ?? 'Failed to create company')
              return
            }
            router.push('/admin/companies')
          }}
        />
      </div>
    </AdminShell>
  )
}
