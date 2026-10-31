'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Clock, Loader2 } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Toast } from '@/components/ui/Toast'
import { hardDeleteUser } from '@/lib/admin/hard-delete-user'
import { getStudentMatches } from '@/lib/supabase/admin'
import { getProfile, updateProfile } from '@/lib/supabase/profile'
import { initials } from '@/lib/format'
import type { Profile, ProfileStatus } from '@/types/database'

const STEPS = ['Profile', 'Experience', 'Skills', 'AI Match']

export default function AdminStudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [matches, setMatches] = useState<
    Array<{
      match_score: number
      match_label: string
      groq_reasoning: string | null
      job_posting?: { company_name?: string; role_title?: string }
    }>
  >([])
  const [status, setStatus] = useState<ProfileStatus>('pending')
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
    visible: boolean
  }>({ message: '', type: 'success', visible: false })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [resumeUrl, setResumeUrl] = useState('')
  const [supplemental, setSupplemental] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    async function load() {
      const p = await getProfile(id)
      setProfile(p)
      if (p) {
        setStatus(p.profile_status ?? 'pending')
        setResumeUrl(p.resume_url ?? '')
        setSupplemental(p.supplemental_interests ?? '')
      }
      setMatches(await getStudentMatches(id))
      setLoading(false)
    }
    load()
  }, [id])

  async function grantPortalAccess() {
    const { error } = await updateProfile(id, { portal_access: true })
    setToast({
      message: error ? error : 'Portal access granted',
      type: error ? 'error' : 'success',
      visible: true,
    })
    if (!error && profile) {
      setProfile({ ...profile, portal_access: true })
    }
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
  }

  async function saveProfileFields() {
    setSavingProfile(true)
    const { error } = await updateProfile(id, {
      resume_url: resumeUrl.trim() || null,
      supplemental_interests: supplemental.trim() || null,
    })
    setSavingProfile(false)
    setToast({
      message: error ? error : 'Profile fields saved',
      type: error ? 'error' : 'success',
      visible: true,
    })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
  }

  async function saveStatus() {
    const { error } = await updateProfile(id, { profile_status: status })
    setToast({
      message: error ? error : 'Status updated',
      type: error ? 'error' : 'success',
      visible: true,
    })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
  }

  async function runMatching() {
    setMatching(true)
    try {
      await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id }),
      })
      setMatches(await getStudentMatches(id))
      setToast({
        message: 'Groq matching complete',
        type: 'success',
        visible: true,
      })
    } catch {
      setToast({
        message: 'Matching failed',
        type: 'error',
        visible: true,
      })
    }
    setMatching(false)
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
  }

  if (loading || !profile) {
    return (
      <AdminShell title="Student Profile">
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-teal" size={32} />
        </div>
      </AdminShell>
    )
  }

  const step = profile.onboarding_step ?? 0

  return (
    <AdminShell title="Student Profile">
      <Link
        href="/admin/students"
        className="text-sm font-medium text-blue hover:underline"
      >
        ← Back to Students
      </Link>

      {profile.portal_access === false ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-semibold text-amber-800">
            <Clock size={20} className="mr-2 inline text-amber-600" />
            This student is on the waitlist — no portal access yet.
          </p>
          <button
            type="button"
            onClick={grantPortalAccess}
            className="rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white"
          >
            Grant Portal Access
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border border-line bg-white p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
                {initials(profile.full_name, profile.email)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy">
                  {profile.full_name}
                </h2>
                <p className="text-sm text-slate">{profile.email}</p>
                <span className="mt-2 inline-block rounded-full border border-teal/20 bg-teal-wash px-2.5 py-1 text-xs font-semibold capitalize text-teal">
                  {profile.profile_status}
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-5">
              {[
                ['University', profile.university],
                ['Major', profile.major],
                ['Grad Year', profile.graduation_year],
                ['Role Type', profile.role_type],
                ['Hours/Week', profile.hours_per_week],
                ['Availability', profile.availability],
                ['LinkedIn', profile.linkedin_url],
                ['GitHub', profile.github_url],
                ['Personal Site', profile.personal_site],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs uppercase tracking-wider text-slate">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-navy">
                    {value ?? '—'}
                  </p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-wider text-slate">
                  Bio
                </p>
                <p className="mt-1 text-sm font-semibold text-navy">
                  {profile.bio ?? '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-7">
            <h3 className="text-lg font-bold text-navy">Resume & interests</h3>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-slate">Resume</p>
              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-semibold text-blue"
                >
                  View on Google Drive →
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate">No resume link yet.</p>
              )}
              <input
                className="mt-3 w-full rounded-xl border border-line px-4 py-2.5 text-sm"
                placeholder="Resume URL"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
              />
            </div>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-slate">
                Supplemental interests
              </p>
              <textarea
                rows={4}
                className="mt-2 w-full rounded-xl bg-canvas p-4 text-sm leading-relaxed text-navy outline-none focus:ring-2 focus:ring-teal/20"
                value={supplemental}
                onChange={(e) => setSupplemental(e.target.value)}
              />
            </div>
            <button
              type="button"
              disabled={savingProfile}
              onClick={saveProfileFields}
              className="mt-4 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              Save resume & interests
            </button>
          </div>

          <div className="rounded-2xl border border-line bg-white p-7">
            <h3 className="text-lg font-bold text-navy">Skills</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(profile.skills ?? []).map((sk) => (
                <span
                  key={sk}
                  className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-navy"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-7">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy">Match Results</h3>
              <button
                type="button"
                disabled={matching}
                onClick={runMatching}
                className="flex items-center gap-2 rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
              >
                {matching ? <Loader2 size={16} className="animate-spin" /> : null}
                Run Groq Matching
              </button>
            </div>
            {matches.length === 0 ? (
              <p className="text-sm text-slate">No matches yet.</p>
            ) : (
              matches.map((m, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 border-b border-line py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      {m.job_posting?.company_name ?? 'Job'} ·{' '}
                      {m.job_posting?.role_title}
                    </p>
                    {m.groq_reasoning ? (
                      <p className="mt-1 text-xs text-slate">{m.groq_reasoning}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-full border border-teal/20 bg-teal-wash px-3 py-1 text-sm font-bold text-teal">
                    {m.match_score}% {m.match_label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-6">
            <h3 className="font-bold text-navy">Manage Status</h3>
            <select
              className="mt-4 w-full rounded-xl border border-line px-4 py-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProfileStatus)}
            >
              <option value="pending">pending</option>
              <option value="verified">verified</option>
              <option value="active">active</option>
            </select>
            <button
              type="button"
              onClick={saveStatus}
              className="mt-4 w-full rounded-full bg-navy py-3 text-sm font-semibold text-white"
            >
              Update Status
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="mt-4 w-full rounded-full border border-red-200 py-2.5 text-sm font-semibold text-red-500"
            >
              Delete Account
            </button>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <h3 className="font-bold text-navy">Onboarding Progress</h3>
            <ul className="mt-4 space-y-3">
              {STEPS.map((name, i) => {
                const done = step > i || (step === 4 && profile.onboarding_complete)
                return (
                  <li key={name} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? 'bg-teal text-white'
                          : 'bg-line text-slate'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span className="text-sm text-navy">{name}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          setDeleteLoading(true)
          const result = await hardDeleteUser(id)
          setDeleteLoading(false)
          if (!result.ok) {
            setToast({
              message: result.error,
              type: 'error',
              visible: true,
            })
            return
          }
          setDeleteOpen(false)
          router.push('/admin/students')
        }}
        title={`Delete ${profile?.full_name ?? profile?.email ?? 'student'}?`}
        description="This permanently deletes their Supabase auth account and profile. This cannot be undone."
        isLoading={deleteLoading}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </AdminShell>
  )
}
