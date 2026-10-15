'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Loader2, Search } from 'lucide-react'
import { OnboardingShell } from './OnboardingShell'
import { SKILL_CATEGORIES } from '@/data/skills'
import { createClient } from '@/lib/supabase/client'
import { completeOnboardingStep, getProfile } from '@/lib/supabase/profile'

export function Step3Skills() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [warn, setWarn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const profile = await getProfile(user.id)
      if (profile?.skills?.length) setSelected(profile.skills)
    })
  }, [])

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return SKILL_CATEGORIES
    const out: Record<string, string[]> = {}
    for (const [cat, skills] of Object.entries(SKILL_CATEGORIES)) {
      const filtered = skills.filter((s) => s.toLowerCase().includes(q))
      if (filtered.length) out[cat] = filtered
    }
    return out
  }, [search])

  function toggle(skill: string) {
    setSelected((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
    setWarn(false)
  }

  async function handleContinue() {
    if (selected.length < 3) {
      setWarn(true)
      return
    }
    if (!userId) return

    setLoading(true)
    const { error } = await completeOnboardingStep(userId, 3, {
      skills: selected,
    })
    setLoading(false)
    if (error) return
    router.push('/onboarding/step/4')
  }

  return (
    <OnboardingShell
      currentStep={3}
      title="Your skills"
      subtitle="Select every technology you can work with in a real sprint. Be honest — this directly affects your match quality."
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/50"
          />
          <input
            className="w-full rounded-xl border border-line bg-white py-3 pl-11 pr-4 text-sm text-navy placeholder:text-slate/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="shrink-0 rounded-full border border-teal/20 bg-teal-wash px-3 py-1 text-xs font-semibold text-teal">
          {selected.length} selected
        </span>
      </div>

      {Object.entries(filteredCategories).map(([category, skills]) => (
        <div key={category}>
          <p className="mb-3 mt-6 text-sm font-bold text-navy">{category}</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const isOn = selected.includes(skill)
              return (
                <motion.button
                  key={skill}
                  type="button"
                  layout
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggle(skill)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                    isOn
                      ? 'bg-navy text-white'
                      : 'border border-line bg-white text-slate hover:border-navy hover:text-navy'
                  }`}
                >
                  {isOn ? <Check size={12} /> : null}
                  {skill}
                </motion.button>
              )
            })}
          </div>
        </div>
      ))}

      {warn ? (
        <p className="mt-4 text-sm text-red-500">
          Select at least 3 skills to continue.
        </p>
      ) : null}

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/onboarding/step/2')}
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
