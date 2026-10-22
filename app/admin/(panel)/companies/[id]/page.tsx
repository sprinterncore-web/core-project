'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { CompanyForm } from '@/components/admin/companies/CompanyForm'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import {
  getAllJobPostings,
  getCompanyUsersForLinking,
  linkCompanyUserByEmail,
  softDeleteCompany,
  updateCompany,
  updateCompanyUser,
} from '@/lib/supabase/admin'
import type { CompanyUser } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import type { Company, JobPosting } from '@/types/database'

export default function EditCompanyPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [error, setError] = useState<string | null>(null)
  const [portalUsers, setPortalUsers] = useState<CompanyUser[]>([])
  const [linkEmail, setLinkEmail] = useState('')
  const [linkMsg, setLinkMsg] = useState<string | null>(null)

  async function loadPortalUsers(co: Company) {
    setPortalUsers(await getCompanyUsersForLinking(id, co.contact_email))
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()
      const co = data as Company
      setCompany(co)
      const all = await getAllJobPostings()
      setJobs(all.filter((j) => j.company_id === id))
      if (co) await loadPortalUsers(co)
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
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="mt-4 w-full rounded-full border border-red-200 py-2.5 text-sm font-semibold text-red-500"
        >
          Delete Company
        </button>
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-white p-6">
        <h3 className="font-bold text-navy">Company Portal Access</h3>
        <p className="mt-1 text-sm text-slate">
          Link company signup accounts to this company record.
        </p>
        {portalUsers.length === 0 ? (
          <p className="mt-4 text-sm text-slate">No portal users found yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {portalUsers.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-canvas px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-navy">
                    {u.full_name} · {u.email}
                  </p>
                  <p className="text-xs text-slate">
                    {u.company_id === id
                      ? 'Linked to this company'
                      : u.company_id
                        ? 'Linked elsewhere'
                        : 'Not linked'}
                  </p>
                </div>
                {u.company_id !== id ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await updateCompanyUser(u.id, { company_id: id })
                      if (company) await loadPortalUsers(company)
                    }}
                    className="rounded-full bg-blue px-4 py-2 text-xs font-semibold text-white"
                  >
                    Link to this company
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <input
            className="min-w-[200px] flex-1 rounded-xl border border-line px-4 py-2 text-sm"
            placeholder="Link by email"
            value={linkEmail}
            onChange={(e) => setLinkEmail(e.target.value)}
          />
          <button
            type="button"
            onClick={async () => {
              const { error: err } = await linkCompanyUserByEmail(
                linkEmail.trim(),
                id
              )
              setLinkMsg(err ?? 'Linked successfully')
              if (!err && company) await loadPortalUsers(company)
            }}
            className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white"
          >
            Link
          </button>
        </div>
        {linkMsg ? (
          <p className="mt-2 text-xs text-slate">{linkMsg}</p>
        ) : null}
      </section>

      {jobs.some((j) => j.submitted_by === 'company') ? (
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/40 p-6">
          <h3 className="font-bold text-navy">
            Sprint Scope (submitted by founder)
          </h3>
          <p className="mt-1 text-sm text-slate">
            Auto-created at founder signup — review before approving.
          </p>
          <ul className="mt-4 space-y-4">
            {jobs
              .filter((j) => j.submitted_by === 'company')
              .map((j) => (
                <li
                  key={j.id}
                  className="rounded-xl border border-line bg-white p-4"
                >
                  <p className="font-semibold text-navy">{j.role_title}</p>
                  <p className="mt-1 text-sm text-slate">
                    {j.sprint_duration} · ${j.payout_amount.toLocaleString()} ·{' '}
                    {j.hours_per_week} hrs/wk
                  </p>
                  <p className="mt-2 text-sm text-navy">{j.milestone_objective}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(j.tech_stack ?? []).map((sk) => (
                      <span
                        key={sk}
                        className="rounded-full bg-canvas px-2 py-0.5 text-xs text-navy"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/admin/jobs/${j.id}`}
                    className="mt-4 inline-block text-sm font-semibold text-blue hover:underline"
                  >
                    Edit in Job Listings →
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

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

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          setDeleteLoading(true)
          await softDeleteCompany(id)
          setDeleteLoading(false)
          setDeleteOpen(false)
          router.push('/admin/companies')
        }}
        title={`Delete ${company.company_name}?`}
        description="This will soft delete the company, all their job listings, and their portal access. All data is preserved."
        isLoading={deleteLoading}
      />
    </AdminShell>
  )
}
