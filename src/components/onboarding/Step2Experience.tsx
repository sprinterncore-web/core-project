'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BarChart2,
  Code2,
  Loader2,
  Palette,
  TrendingUp,
} from 'lucide-react'
import { OnboardingShell } from './OnboardingShell'
import { ROLE_TYPES } from '@/data/skills'
import type { Availability, RoleType } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { completeOnboardingStep, getProfile } from '@/lib/supabase/profile'

const ICON_MAP = {
  Code2,
  Palette,
  TrendingUp,
  BarChart2,
} as const

const HOURS_OPTIONS = [
  { label: '10 hrs / week', value: 10 },
  { label: '15 hrs / week', value: 15 },
  { label: '20+ hrs / week', value: 20 },
]

const AVAIL_OPTIONS: { label: string; value: Availability }[] = [
  { label: 'Immediately', value: 'immediate' },
  { label: 'In 2 weeks', value: '2weeks' },
  { label: 'Next month', value: 'nextmonth' },
]

export function Step2Experience() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [roleType, setRoleType] = useState<RoleType | null>(null)
  const [hours, setHours] = useState<number | null>(null)
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const profile = await getProfile(user.id)
      if (profile) {
        setRoleType(profile.role_type)
        setHours(profile.hours_per_week)
        setAvailability(profile.availability)
      }
    })
  }, [])

  async function handleContinue() {
    if (!roleType || hours === null || !availability) {
      setError('Please complete all selections.')
      return
    }
    if (!userId) return

    setLoading(true)
    setError(null)
    const { error: saveError } = await completeOnboardingStep(userId, 2, {
      role_type: roleType,
      hours_per_week: hours,
      availability,
    })
    setLoading(false)
    if (saveError) {
      setError(saveError)
      return
    }
    router.push('/onboarding/step/3')
  }

  return (
    <OnboardingShell
      currentStep={2}
      title="Your experience"
      subtitle="What kind of sprint work fits your life right now?"
    >
      <section className="mb-8">
        <p className="mb-4 text-base font-bold text-navy">
          What best describes your role?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_TYPES.map((role) => {
            const Icon = ICON_MAP[role.icon as keyof typeof ICON_MAP]
            const selected = roleType === role.value
            return (
              <motion.button
                key={role.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRoleType(role.value)}
                className={`rounded-2xl p-5 text-left transition-all ${
                  selected
                    ? 'border-2 border-navy bg-navy'
                    : 'border border-line bg-white hover:border-navy/40'
                }`}
              >
                <Icon
                  size={24}
                  className={selected ? 'text-teal' : 'text-slate'}
                />
                <p
                  className={`mt-3 text-base font-bold ${selected ? 'text-white' : 'text-navy'}`}
                >
                  {role.label}
                </p>
                <p
                  className={`mt-1 text-sm ${selected ? 'text-white/60' : 'text-slate'}`}
                >
                  {role.description}
                </p>
              </motion.button>
            )
          })}
        </div>
      </section>

      <section className="mb-8">
        <p className="mb-4 text-base font-bold text-navy">
          How many hours per week can you commit?
        </p>
        <div className="flex flex-wrap gap-3">
          {HOURS_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setHours(opt.value)}
              className={`rounded-full px-6 py-3 text-sm ${
                hours === opt.value
                  ? 'border-teal bg-teal font-semibold text-white'
                  : 'border border-line bg-white font-medium text-slate'
              }`}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <p className="mb-4 text-base font-bold text-navy">
          When can you start your first sprint?
        </p>
        <div className="flex flex-wrap gap-3">
          {AVAIL_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAvailability(opt.value)}
              className={`rounded-full px-6 py-3 text-sm ${
                availability === opt.value
                  ? 'border-teal bg-teal font-semibold text-white'
                  : 'border border-line bg-white font-medium text-slate'
              }`}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </section>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/onboarding/step/1')}
          className="text-sm font-medium text-slate hover:text-navy"
        >
          ← Back
        </button>
        <motion.button
          type="button"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          className="flex items-center gap-2 rounded-full bg-teal px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-dark disabled:opacity-70"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          Continue →
        </motion.button>
      </div>
    </OnboardingShell>
  )
}
