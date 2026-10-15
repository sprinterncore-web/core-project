'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { JobForm } from '@/components/admin/jobs/JobForm'
import {
  getAllCompanies,
  getJobMatches,
  updateJobPosting,
} from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/client'
import type { JobPosting } from '@/types/database'

export default function EditJobPage() {
  const params = useParams()
  const id = String(params.id)
  const [job, setJob] = useState<JobPosting | null>(null)
  const [companies, setCompanies] = useState<Awaited<ReturnType<typeof getAllCompanies>>>([])
  const [matches, setMatches] = useState<
    Array<{
      match_score: number
      match_label: string
      groq_reasoning: string | null
      profile?: { full_name?: string; university?: string; email?: string }
    }>
  >([])
  const [error, setError] = useState<string | null>(null)
  const [rematching, setRematching] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', id)
        .single()
      setJob(data as JobPosting)
      setCompanies(await getAllCompanies())
      setMatches(await getJobMatches(id))
    }
    load()
  }, [id])

  async function triggerRematch() {
    setRematching(true)
    await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: id }),
    })
    setMatches(await getJobMatches(id))
    setRematching(false)
  }

  if (!job) {
    return (
      <AdminShell title="Edit Job">
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-teal" />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Edit Job Listing">
      <Link
        href="/admin/jobs"
        className="text-sm font-medium text-blue hover:underline"
      >
        ← Back to Jobs
      </Link>
      <div className="mt-6">
        <JobForm
          companies={companies}
          initial={job}
          submitLabel="Save Changes →"
          error={error}
          onSubmit={async (values) => {
            const { error: err } = await updateJobPosting(id, values)
            if (err) setError(err)
            else setError(null)
          }}
        />
      </div>

      <section className="mt-12 rounded-2xl border border-line bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-navy">Match Results for this Job</h3>
          <button
            type="button"
            disabled={rematching}
            onClick={triggerRematch}
            className="rounded-full bg-teal px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {rematching ? 'Running…' : 'Trigger Re-match'}
          </button>
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-slate">No matches yet.</p>
        ) : (
          matches.map((m, i) => (
            <div
              key={i}
              className="border-b border-line py-3 last:border-0"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy">
                  {m.profile?.full_name ?? 'Student'} ·{' '}
                  {m.profile?.university}
                </p>
                <span className="rounded-full border border-teal/20 bg-teal-wash px-3 py-1 text-xs font-bold text-teal">
                  {m.match_score}% {m.match_label}
                </span>
              </div>
              {m.groq_reasoning ? (
                <p className="mt-1 text-xs text-slate">{m.groq_reasoning}</p>
              ) : null}
            </div>
          ))
        )}
      </section>
    </AdminShell>
  )
}
