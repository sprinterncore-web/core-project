'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Eye, EyeOff, FileText, Loader2 } from 'lucide-react'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'
import { UniversitySelect } from '@/components/ui/UniversitySelect'
import { createClient } from '@/lib/supabase/client'
import { isTestingMode } from '@/lib/testing'
import { TestingBanner } from '@/components/ui/TestingBanner'
import { SKILL_CATEGORIES } from '@/data/skills'
import { getClientSiteUrl } from '@/lib/site-url'
import { updateProfile } from '@/lib/supabase/profile'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [resumeUrl, setResumeUrl] = useState('')
  const [supplemental, setSupplemental] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testingMode, setTestingMode] = useState(false)
  const [showTesting, setShowTesting] = useState(false)
  const [skillWarn, setSkillWarn] = useState(false)

  useEffect(() => {
    setShowTesting(isTestingMode())
  }, [])

  const currentYear = new Date().getFullYear()
  const gradYears = Array.from({ length: 7 }, (_, i) => currentYear - 2 + i)

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
    setSkillWarn(false)
  }

  async function handleAccountContinue(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!testingMode && !email.toLowerCase().endsWith('.edu')) {
      setError('A university .edu email address is required to sign up.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    let signupEmail = email
    let { data, error: signUpError } = await supabase.auth.signUp({
      email: signupEmail,
      password,
      options: {
        emailRedirectTo: `${getClientSiteUrl()}/auth/callback`,
      },
    })

    if (
      signUpError?.message?.toLowerCase().includes('already registered') &&
      testingMode
    ) {
      const timestamp = Date.now().toString().slice(-4)
      signupEmail = email.replace('@', `+test${timestamp}@`)
      const retry = await supabase.auth.signUp({
        email: signupEmail,
        password,
        options: {
          emailRedirectTo: `${getClientSiteUrl()}/auth/callback`,
        },
      })
      data = retry.data
      signUpError = retry.error
    }

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      setUserId(data.user.id)
      setEmail(signupEmail)
      setStep(2)
    }
    setLoading(false)
  }

  async function handleProfileComplete(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const resolvedUniversity = university.trim()
    if (!resolvedUniversity || resolvedUniversity === 'Other') {
      setError('Please select or enter your university.')
      return
    }
    if (skills.length < 3) {
      setSkillWarn(true)
      return
    }
    try {
      new URL(resumeUrl.trim())
    } catch {
      setError('Please enter a valid resume link (URL).')
      return
    }

    const supabase = createClient()
    let id = userId
    if (!id) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      id = user?.id ?? null
    }
    if (!id) {
      setError(
        'Could not start a session after signup. Confirm your email, or enable testing mode and try again.'
      )
      return
    }
    setUserId(id)

    setLoading(true)
    const { error: updateError } = await updateProfile(id, {
      email,
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      university: resolvedUniversity,
      major: major.trim(),
      graduation_year: parseInt(gradYear, 10),
      skills,
      resume_url: resumeUrl.trim(),
      supplemental_interests: supplemental.trim() || null,
      onboarding_complete: true,
      onboarding_step: 4,
    })

    setLoading(false)
    if (updateError) {
      setError(updateError)
      return
    }
    router.push('/dashboard')
  }

  const skillCategories = useMemo(() => SKILL_CATEGORIES, [])

  return (
    <div className="min-h-screen bg-canvas">
      <AuthLeftPanel />
      <div className="lg:ml-[50%]">
        <div className="mx-auto max-w-md px-6 py-16">
          {showTesting ? (
            <TestingBanner enabled={testingMode} onChange={setTestingMode} />
          ) : null}

          {step === 1 ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate/50">
                Step 1 of 2
              </p>
              <h1 className="mt-1 text-2xl font-bold text-navy">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-slate">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-semibold text-teal hover:underline"
                >
                  Log in
                </Link>
              </p>
              <form
                onSubmit={handleAccountContinue}
                className="mt-8 flex flex-col gap-4"
              >
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
                {!testingMode ? (
                  <p className="-mt-2 text-xs text-slate/60">
                    University .edu email required
                  </p>
                ) : null}
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    minLength={8}
                    placeholder="Password (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex items-start gap-2">
                  <input required type="checkbox" id="terms" className="mt-1" />
                  <label htmlFor="terms" className="text-sm text-slate">
                    I agree to the{' '}
                    <Link href="/terms" className="text-teal">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-teal">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-teal py-3.5 font-bold text-white hover:bg-teal-dark disabled:opacity-70"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                  Continue →
                </motion.button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-navy">Set up your profile</h2>
              <p className="mt-1 text-sm text-slate">Step 2 of 2</p>
              <form
                onSubmit={handleProfileComplete}
                className="mt-8 flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="First name *"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    required
                    placeholder="Last name *"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <UniversitySelect
                  value={university}
                  onChange={setUniversity}
                  required
                />
                <input
                  required
                  placeholder="e.g. Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className={inputClass}
                />
                <select
                  required
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Graduation year *
                  </option>
                  {gradYears.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>

                <div>
                  <p className="mb-2 text-sm font-semibold text-navy">
                    Skills *
                  </p>
                  <p className="mb-3 text-xs text-slate">
                    Select at least 3 skills
                  </p>
                  {Object.entries(skillCategories).map(([cat, list]) => (
                    <div key={cat} className="mb-4">
                      <p className="mb-2 text-xs font-bold text-navy">{cat}</p>
                      <div className="flex flex-wrap gap-2">
                        {list.map((skill) => {
                          const on = skills.includes(skill)
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${
                                on
                                  ? 'bg-navy text-white'
                                  : 'border border-line bg-white text-slate'
                              }`}
                            >
                              {on ? <Check size={10} /> : null}
                              {skill}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {skillWarn ? (
                    <p className="text-sm text-red-500">
                      Select at least 3 skills.
                    </p>
                  ) : null}
                </div>

                <div>
                  <div className="relative">
                    <FileText
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/50"
                    />
                    <input
                      required
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate/60">
                    Paste a shareable Google Drive link to your resume
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-navy">
                    Describe any additional interests or areas you&apos;d like to
                    explore
                  </label>
                  <textarea
                    rows={3}
                    maxLength={400}
                    placeholder="e.g. I'm interested in AI product design, climate tech, and community-building startups..."
                    value={supplemental}
                    onChange={(e) => setSupplemental(e.target.value)}
                    className={`${inputClass} mt-2`}
                  />
                  <p className="mt-1 text-right text-xs text-slate/50">
                    {supplemental.length}/400
                  </p>
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-teal py-3.5 font-bold text-white hover:bg-teal-dark disabled:opacity-70"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                  Complete Profile →
                </motion.button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
