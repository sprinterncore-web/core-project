'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Info } from 'lucide-react'
import { CompanyPortalNav } from '@/components/company/CompanyPortalNav'
import { JobPostingForm } from '@/components/company/JobPostingForm'
import { createClient } from '@/lib/supabase/client'
import {
  getCompanyById,
  getCompanyUser,
  submitJobPosting,
} from '@/lib/supabase/company'
import type { Company } from '@/types/database'

export default function NewCompanyJobPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const cu = await getCompanyUser(user.id)
      setUserName(cu?.full_name ?? 'User')
      if (cu?.company_id) {
        setCompany(await getCompanyById(cu.company_id))
      }
    }
    load()
  }, [])

  if (!company) {
    return (
      <>
        <CompanyPortalNav companyName="Your Company" userName={userName} />
        <main className="mx-auto max-w-3xl px-6 py-10">
          <p className="text-slate">
            Your company must be linked before you can post roles.{' '}
            <Link href="/book" className="text-blue hover:underline">
              Book an intro call
            </Link>{' '}
            or contact hello@sprintern.co.
          </p>
        </main>
      </>
    )
  }

  return (
    <>
      <CompanyPortalNav
        companyName={company.company_name}
        userName={userName}
      />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/company/jobs"
          className="text-sm font-medium text-blue hover:underline"
        >
          ← Back to Listings
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-navy">Post a Sprint Role</h1>
        <p className="mt-2 text-base text-slate">
          Our team will review your listing within 24 hours before it goes live
          to matched students.
        </p>

        {success ? (
          <div className="mt-10 rounded-2xl border border-line bg-white p-10 text-center">
            <CheckCircle2 size={48} className="mx-auto text-teal" />
            <h2 className="mt-4 text-xl font-bold text-navy">
              Listing submitted for review
            </h2>
            <p className="mt-2 text-sm text-slate">
              Our team will review and approve your sprint role within 24 hours.
              You&apos;ll receive an email notification when it goes live.
            </p>
            <Link
              href="/company/jobs"
              className="mt-6 inline-block rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white"
            >
              View all listings →
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue/15 bg-blue/5 px-5 py-4">
              <Info size={16} className="mt-0.5 flex-shrink-0 text-blue" />
              <p className="text-sm text-navy">
                Your listing will be reviewed by our team before going live.
                We&apos;ll notify you by email once it&apos;s approved.
              </p>
            </div>
            {error ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <div className="mt-8">
              <JobPostingForm
                companyId={company.id}
                companyName={company.company_name}
                companyInitial={company.company_initial}
                companyStage={company.stage}
                isLoading={loading}
                submitLabel="Submit for Review"
                onSubmit={async (data) => {
                  setLoading(true)
                  setError(null)
                  const { id, error: err } = await submitJobPosting(data)
                  setLoading(false)
                  if (err || !id) {
                    setError(err ?? 'Failed to submit')
                    return
                  }
                  setSuccess(true)
                }}
              />
            </div>
          </>
        )}
      </main>
    </>
  )
}
