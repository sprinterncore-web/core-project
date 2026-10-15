'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Zap } from 'lucide-react'
import { OnboardingShell } from './OnboardingShell'
import { MatchCard } from '@/components/dashboard/MatchCard'
import { DUMMY_MATCHES } from '@/data/dummy-matches'
import { createClient } from '@/lib/supabase/client'
import { completeOnboardingStep, getProfile } from '@/lib/supabase/profile'
import type { Profile } from '@/types/database'

const STATUS_LINES = [
  { at: 0, text: 'Analysing your profile...' },
  { at: 800, text: 'Cross-referencing 12,000+ student profiles...' },
  { at: 1600, text: 'Calibrating sprint compatibility...' },
  { at: 2400, text: 'Generating your curated match list...' },
]

export function Step4AIMatch() {
  const router = useRouter()
  const [phase, setPhase] = useState<'loading' | 'results'>('loading')
  const [statusIndex, setStatusIndex] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        setProfile(await getProfile(user.id))
      }
    })

    const timers = STATUS_LINES.map((line, i) =>
      setTimeout(() => setStatusIndex(i), line.at)
    )
    const done = setTimeout(() => setPhase('results'), 3000)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [])

  async function handleViewAll() {
    if (!userId) return
    setFinishing(true)
    await completeOnboardingStep(userId, 4, { onboarding_complete: true })
    router.push('/dashboard')
  }

  const skills = profile?.skills?.slice(0, 4) ?? ['TypeScript', 'Next.js']
  const hours = profile?.hours_per_week ?? 15

  if (phase === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue to-teal"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <Zap size={28} className="text-white" />
        </motion.div>

        <div className="mt-8 h-2 w-64 overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue to-teal"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.8, ease: 'easeInOut' }}
          />
        </div>

        <motion.p
          key={statusIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-slate"
        >
          {STATUS_LINES[statusIndex]?.text}
        </motion.p>
      </div>
    )
  }

  return (
    <OnboardingShell
      currentStep={4}
      title=""
      subtitle=""
      showStageBadge
    >
      <div className="relative">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              Your Curated Engineering Sprint Matches
            </h1>
            <p className="mt-3 text-base text-slate">
              Based on your verified stack (
              {skills.map((s, i) => (
                <strong key={s} className="text-navy">
                  {i > 0 ? ', ' : ''}
                  {s}
                </strong>
              ))}
              ) and {hours}/week availability. Matched with high-growth
              venture-backed teams ready to kick off this week.
            </p>
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-line bg-white p-5 shadow-sm lg:w-56">
            <p className="text-xs font-semibold text-slate">Match Calibration</p>
            <p className="text-2xl font-bold text-navy">98% Fit</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue to-teal"
                initial={{ width: 0 }}
                animate={{ width: '98%' }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <p className="mt-2 text-xs text-slate/60">
              Reviewed by 12 teams · 3 Instant Offers
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {DUMMY_MATCHES.slice(0, 2).map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} compact />
          ))}
        </div>

        <motion.button
          type="button"
          disabled={finishing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleViewAll}
          className="mt-6 flex items-center gap-2 rounded-full bg-teal px-8 py-3.5 font-semibold text-white hover:bg-teal-dark disabled:opacity-70"
        >
          {finishing ? <Loader2 size={18} className="animate-spin" /> : null}
          View all {DUMMY_MATCHES.length} matches →
        </motion.button>
      </div>
    </OnboardingShell>
  )
}
