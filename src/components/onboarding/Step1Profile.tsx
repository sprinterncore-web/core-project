'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Code2, Globe, Link2, Loader2 } from 'lucide-react'
import {
  OnboardingShell,
  inputClass,
  labelClass,
} from './OnboardingShell'
import { createClient } from '@/lib/supabase/client'
import { completeOnboardingStep, getProfile } from '@/lib/supabase/profile'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

export function Step1Profile() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [bio, setBio] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [personalSite, setPersonalSite] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const profile = await getProfile(user.id)
      if (profile) {
        const parts = (profile.full_name ?? '').split(/\s+/)
        setFirstName(parts[0] ?? '')
        setLastName(parts.slice(1).join(' ') ?? '')
        setUniversity(profile.university ?? '')
        setMajor(profile.major ?? '')
        setGradYear(profile.graduation_year?.toString() ?? '')
        setBio(profile.bio ?? '')
        setLinkedin(profile.linkedin_url ?? '')
        setGithub(profile.github_url ?? '')
        setPersonalSite(profile.personal_site ?? '')
      }
    })
  }, [])

  async function handleContinue() {
    const nextErrors: Record<string, string> = {}
    if (!firstName.trim()) nextErrors.firstName = 'Required'
    if (!lastName.trim()) nextErrors.lastName = 'Required'
    if (!university.trim()) nextErrors.university = 'Required'
    if (!major.trim()) nextErrors.major = 'Required'
    if (!gradYear) nextErrors.gradYear = 'Required'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !userId) return

    setLoading(true)
    const { error } = await completeOnboardingStep(userId, 1, {
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      university: university.trim(),
      major: major.trim(),
      graduation_year: parseInt(gradYear, 10),
      bio: bio.trim() || null,
      linkedin_url: linkedin.trim() || null,
      github_url: github.trim() || null,
      personal_site: personalSite.trim() || null,
    })
    setLoading(false)
    if (error) {
      setErrors({ form: error })
      return
    }
    router.push('/onboarding/step/2')
  }

  const errInput = 'border-red-300 focus:border-red-400 focus:ring-red/10'

  return (
    <OnboardingShell
      currentStep={1}
      title="Your profile"
      subtitle="This is what sprint leads see first. Keep it sharp — you only need 2 minutes."
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First name</label>
            <input
              className={`${inputClass} ${errors.firstName ? errInput : ''}`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <FieldError msg={errors.firstName} />
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input
              className={`${inputClass} ${errors.lastName ? errInput : ''}`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <FieldError msg={errors.lastName} />
          </div>
        </div>

        <div>
          <label className={labelClass}>University</label>
          <input
            className={`${inputClass} ${errors.university ? errInput : ''}`}
            placeholder="e.g. UC Berkeley"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
          />
          <FieldError msg={errors.university} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Major</label>
            <input
              className={`${inputClass} ${errors.major ? errInput : ''}`}
              placeholder="e.g. Computer Science"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
            <FieldError msg={errors.major} />
          </div>
          <div>
            <label className={labelClass}>Graduation year</label>
            <select
              className={`${inputClass} ${errors.gradYear ? errInput : ''}`}
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
            >
              <option value="" disabled>
                Select year
              </option>
              {['2025', '2026', '2027', '2028', '2029'].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <FieldError msg={errors.gradYear} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Bio</label>
          <div className="relative">
            <textarea
              rows={3}
              maxLength={200}
              placeholder="1–2 sentences. What do you build and why startups should work with you."
              className={inputClass}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <span className="absolute bottom-2 right-3 text-xs text-slate/50">
              {bio.length} / 200
            </span>
          </div>
        </div>

        <div>
          <label className={labelClass}>LinkedIn URL</label>
          <div className="relative">
            <Link2
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/50"
            />
            <input
              className={`${inputClass} pl-10`}
              placeholder="linkedin.com/in/yourname"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>GitHub URL</label>
          <div className="relative">
            <Code2
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/50"
            />
            <input
              className={`${inputClass} pl-10`}
              placeholder="github.com/yourusername"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Personal site (optional)</label>
          <div className="relative">
            <Globe
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/50"
            />
            <input
              className={`${inputClass} pl-10`}
              placeholder="yoursite.com (optional)"
              value={personalSite}
              onChange={(e) => setPersonalSite(e.target.value)}
            />
          </div>
        </div>

        {errors.form ? (
          <p className="text-sm text-red-500">{errors.form}</p>
        ) : null}

        <div className="mt-10 flex items-center justify-between">
          <div />
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
      </div>
    </OnboardingShell>
  )
}
