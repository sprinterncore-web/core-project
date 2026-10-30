'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { AvailabilityGrid } from '@/components/profile/AvailabilityGrid'
import { CompanyPreviewCard } from '@/components/profile/CompanyPreviewCard'
import { ProfileSaveBar } from '@/components/profile/ProfileSaveBar'
import { SkillsEditor } from '@/components/profile/SkillsEditor'
import { SprintHistory } from '@/components/profile/SprintHistory'
import { SprintPitchEditor } from '@/components/profile/SprintPitchEditor'
import { Toast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import {
  calculateProfileCompletion,
  normalizeProfile,
} from '@/lib/profileCompletion'
import { getProfile, updateProfile } from '@/lib/supabase/profile'
import { getMatchesForStudent } from '@/lib/supabase/matches'
import type { MatchResult, Profile } from '@/types/database'

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewWaitlistSignup = searchParams.get('waitlisted') === 'true'
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [rematching, setRematching] = useState(false)
  const [matchMsg, setMatchMsg] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    visible: boolean
    message: string
    type: 'success' | 'error'
  }>({ visible: false, message: '', type: 'success' })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }
      setUserId(user.id)
      setUserEmail(user.email ?? '')
      const data = await getProfile(user.id)
      if (!data) {
        setLoading(false)
        return
      }
      const normalized = normalizeProfile(data)
      setOriginalProfile(normalized)
      setProfile(normalized)
      setMatches(await getMatchesForStudent(user.id))
      setLoading(false)
    }
    load()
  }, [router])

  const isDirty = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(originalProfile),
    [profile, originalProfile]
  )

  const completionPct = calculateProfileCompletion(profile)

  const handleChange = (updates: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev))
  }

  const handleSave = async () => {
    if (!profile || !userId) return
    setIsSaving(true)
    const { error } = await updateProfile(userId, {
      full_name: profile.full_name,
      university: profile.university,
      major: profile.major,
      graduation_year: profile.graduation_year,
      sprint_pitch: profile.sprint_pitch,
      best_project_name: profile.best_project_name,
      best_project_url: profile.best_project_url,
      skills: profile.skills,
      skill_proofs: profile.skill_proofs,
      availability_hours: profile.availability_hours,
      hours_per_week: profile.hours_per_week,
      github_url: profile.github_url,
      linkedin_url: profile.linkedin_url,
    })
    if (!error) {
      setOriginalProfile(profile)
      setToast({ visible: true, message: 'Profile saved', type: 'success' })
      fetch('/api/match', { method: 'POST' }).then(() => {
        setTimeout(() => {
          getMatchesForStudent(userId).then(setMatches)
        }, 3000)
      })
    } else {
      setToast({ visible: true, message: 'Failed to save', type: 'error' })
    }
    setIsSaving(false)
  }

  const handleDiscard = () => {
    setProfile(originalProfile)
  }

  async function runMatching() {
    if (!userId) return
    setRematching(true)
    setMatchMsg(null)
    try {
      const res = await fetch('/api/match', { method: 'POST' })
      if (!res.ok) throw new Error('failed')
      setMatchMsg('✓ Scores updated')
      setTimeout(() => getMatchesForStudent(userId).then(setMatches), 3000)
    } catch {
      setToast({ visible: true, message: 'Matching failed', type: 'error' })
    }
    setRematching(false)
  }

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-teal" size={40} />
      </div>
    )
  }

  const completionItems = [
    {
      ok: !!(profile.full_name && profile.university && profile.major && profile.graduation_year),
      label: 'Basic info filled',
    },
    { ok: !!profile.sprint_pitch?.trim(), label: 'Sprint pitch written' },
    { ok: (profile.skills?.length ?? 0) >= 5, label: '5+ skills selected' },
    { ok: (profile.skill_proofs?.length ?? 0) > 0, label: 'Proof link added' },
    {
      ok: Object.values(profile.availability_hours ?? {}).some(
        (a) => a && a.length > 0
      ),
      label: 'Availability set',
    },
    { ok: !!profile.github_url?.trim(), label: 'GitHub linked' },
    { ok: !!profile.linkedin_url?.trim(), label: 'LinkedIn linked' },
  ]

  const circumference = 2 * Math.PI * 36
  const dashOffset = circumference * (1 - completionPct / 100)

  return (
    <>
      <DashboardNav
        userEmail={userEmail}
        userName={profile.full_name}
      />

      <main className="mx-auto max-w-[1280px] px-6 py-10 pb-28">
        {isNewWaitlistSignup ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue/20 bg-gradient-to-r from-teal-wash to-blue/5 p-5">
            <span className="text-2xl" aria-hidden>
              🎉
            </span>
            <div>
              <p className="text-sm font-semibold text-navy">
                You&apos;re in — complete your profile!
              </p>
              <p className="mt-0.5 text-sm text-slate">
                Fill out your profile now so you&apos;re ready when your cohort
                opens. We&apos;ll email you at{' '}
                <span className="font-medium text-blue">{userEmail}</span> when
                it&apos;s your turn.
              </p>
            </div>
          </div>
        ) : null}
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy">Your Sprint Profile</h1>
            <p className="mt-2 text-base text-slate">
              This is exactly what companies see when you match.
            </p>
          </div>
          <div className="flex items-center rounded-full bg-line/50 p-1">
            {(['Edit', 'Company Preview'] as const).map((label) => {
              const active =
                label === 'Edit' ? !previewMode : previewMode
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setPreviewMode(label === 'Company Preview')}
                  className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    active ? 'text-navy' : 'text-slate hover:text-navy'
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="preview-toggle"
                      className="absolute inset-0 rounded-full bg-white shadow-sm"
                    />
                  ) : null}
                  <span className="relative z-10">{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {previewMode ? (
          <CompanyPreviewCard profile={profile} matches={matches} />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SprintPitchEditor profile={profile} onChange={handleChange} />
              <SkillsEditor
                skills={profile.skills ?? []}
                skillProofs={profile.skill_proofs ?? []}
                onChange={(skills, skill_proofs) =>
                  handleChange({ skills, skill_proofs })
                }
              />
              <AvailabilityGrid
                availabilityHours={profile.availability_hours ?? {}}
                hoursPerWeek={profile.hours_per_week ?? 0}
                onChange={(availability_hours, total) =>
                  handleChange({ availability_hours, hours_per_week: total })
                }
              />
            </div>

            <div>
              <div className="rounded-2xl border border-line bg-white p-6">
                <h3 className="text-base font-bold text-navy">Profile Strength</h3>
                <div className="relative mx-auto mt-6 h-24 w-24">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-line"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="text-teal"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: dashOffset }}
                      transition={{ duration: 0.8 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-navy">
                      {completionPct}%
                    </span>
                    <span className="text-xs text-slate">Complete</span>
                  </div>
                </div>
                <ul className="mt-5 flex flex-col gap-2">
                  {completionItems.map(({ ok, label }) => (
                    <li key={label} className="flex items-center gap-3">
                      {ok ? (
                        <CheckCircle2 size={18} className="text-teal" />
                      ) : (
                        <Circle size={18} className="text-slate/30" />
                      )}
                      <span
                        className={`text-sm ${ok ? 'text-navy' : 'text-slate/60'}`}
                      >
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 rounded-2xl border border-line bg-white p-6">
                <h3 className="mb-4 text-base font-bold text-navy">
                  Your Current Match Scores
                </h3>
                {matches.length > 0 ? (
                  <>
                    {matches.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between border-b border-line py-3 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-xs font-bold text-white">
                            {m.job_posting?.company_initial ?? '?'}
                          </div>
                          <span className="text-sm text-navy">
                            {m.job_posting?.company_name ?? 'Company'}
                          </span>
                        </div>
                        {m.match_score > 0 &&
                        m.match_label !== 'PENDING MATCH' ? (
                          <span className="rounded-full bg-teal-wash px-2.5 py-1 text-xs font-bold text-teal">
                            {m.match_score}% {m.match_label}
                          </span>
                        ) : (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
                            ⏳ Pending
                          </span>
                        )}
                      </div>
                    ))}
                    <p className="mt-4 text-xs italic text-slate/50">
                      These scores update when you improve your profile.
                    </p>
                    <button
                      type="button"
                      disabled={rematching}
                      onClick={runMatching}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-navy py-2 text-center text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {rematching ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : null}
                      Re-run AI Matching
                    </button>
                    {matchMsg ? (
                      <p className="mt-2 text-xs text-teal">{matchMsg}</p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate">No matches yet.</p>
                    <p className="mt-1 text-xs text-slate/60">
                      Complete your profile to trigger AI matching.
                    </p>
                    <button
                      type="button"
                      disabled={rematching}
                      onClick={runMatching}
                      className="mt-4 w-full rounded-full bg-teal py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      Run AI Matching →
                    </button>
                  </>
                )}
              </div>

              <SprintHistory />
            </div>
          </div>
        )}
      </main>

      <ProfileSaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  )
}
