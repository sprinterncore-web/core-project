'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Briefcase,
  Check,
  Code2,
  Eye,
  EyeOff,
  Loader2,
  Megaphone,
  Palette,
  Presentation,
  TrendingUp,
  Users,
} from 'lucide-react'
import { CompanyAuthLeftPanel } from '@/components/company/CompanyAuthLeftPanel'
import { Toggle } from '@/components/ui/Toggle'
import { createClient } from '@/lib/supabase/client'
import { isTestingMode } from '@/lib/testing'
import { TestingBanner } from '@/components/ui/TestingBanner'
import { SKILL_CATEGORIES } from '@/data/skills'
import { getClientSiteUrl } from '@/lib/site-url'
import type { RoleType } from '@/types/database'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-blue focus:ring-2 focus:ring-blue/20'

const personalDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
]

const PROJECT_TYPES = [
  { id: 'Engineering', icon: Code2 },
  { id: 'Marketing', icon: Megaphone },
  { id: 'Design', icon: Palette },
  { id: 'Growth', icon: TrendingUp },
  { id: 'Student Ambassador', icon: Users },
  { id: 'Research', icon: BookOpen },
  { id: 'Other', icon: Briefcase },
] as const

function mapProjectTypeToRole(type: string): RoleType {
  switch (type) {
    case 'Design':
      return 'designer'
    case 'Growth':
    case 'Marketing':
    case 'Student Ambassador':
      return 'growth'
    case 'Research':
      return 'data'
    default:
      return 'developer'
  }
}

export default function CompanySignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [founderFirst, setFounderFirst] = useState('')
  const [founderLast, setFounderLast] = useState('')
  const [founderTitle, setFounderTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [fundingStage, setFundingStage] = useState('')
  const [website, setWebsite] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [pitchDeckUrl, setPitchDeckUrl] = useState('')

  const [projectType, setProjectType] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [majorRequired, setMajorRequired] = useState(false)
  const [requiredMajor, setRequiredMajor] = useState('')
  const [duration, setDuration] = useState('')
  const [payout, setPayout] = useState('')
  const [reportingTo, setReportingTo] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testingMode, setTestingMode] = useState(false)
  const [showTesting, setShowTesting] = useState(false)
  const [skillWarn, setSkillWarn] = useState(false)

  useEffect(() => {
    setShowTesting(isTestingMode())
  }, [])

  const founderName = `${founderFirst.trim()} ${founderLast.trim()}`.trim()
  const companyInitial = companyName.trim().charAt(0).toUpperCase() || 'C'

  const skillCategories = useMemo(() => SKILL_CATEGORIES, [])

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
    setSkillWarn(false)
  }

  async function handleAccount(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!testingMode) {
      const emailDomain = email.split('@')[1]?.toLowerCase()
      if (personalDomains.includes(emailDomain ?? '')) {
        setError('Please use your company work email.')
        setLoading(false)
        return
      }
    }

    const supabase = createClient()
    let signupEmail = email
    let { data, error: signUpError } = await supabase.auth.signUp({
      email: signupEmail,
      password,
      options: {
        emailRedirectTo: `${getClientSiteUrl()}/company/callback`,
        data: { account_type: 'company' },
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
          emailRedirectTo: `${getClientSiteUrl()}/company/callback`,
          data: { account_type: 'company' },
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

  function validateCompanyProfile() {
    if (!founderFirst.trim() || !founderLast.trim()) return 'Founder name is required.'
    if (!founderTitle) return 'Founder title is required.'
    if (!companyName.trim()) return 'Company name is required.'
    if (!teamSize) return 'Team size is required.'
    if (!fundingStage) return 'Funding stage is required.'
    if (!website.trim()) return 'Company website is required.'
    return null
  }

  function validateSprintScope() {
    if (!projectType) return 'Select a project type.'
    if (skills.length < 2) return 'Select at least 2 skillsets.'
    if (majorRequired && !requiredMajor.trim()) return 'Specify required major.'
    if (!duration) return 'Select sprint duration.'
    if (!payout || Number(payout) <= 0) return 'Enter a valid stipend amount.'
    if (!reportingTo) return 'Select who the student reports to.'
    if (!hoursPerWeek) return 'Select hours per week.'
    return null
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault()
    const scopeErr = validateSprintScope()
    if (scopeErr) {
      setError(scopeErr)
      if (skills.length < 2) setSkillWarn(true)
      return
    }

    const supabase = createClient()
    let uid = userId
    if (!uid) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Session expired. Please sign up again.')
        return
      }
      uid = user.id
    }

    setLoading(true)
    setError(null)

    const hoursNum = parseInt(hoursPerWeek.replace(/\D/g, ''), 10)
    const payoutNum = parseInt(payout.replace(/\D/g, ''), 10)
    const milestoneBase =
      additionalContext.trim() ||
      `${projectType} sprint project with focus on ${skills.join(', ')}.`
    const milestone = majorRequired
      ? `${milestoneBase} Required major: ${requiredMajor.trim()}.`
      : milestoneBase

    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        company_name: companyName.trim(),
        company_initial: companyInitial,
        website: website.trim(),
        stage: fundingStage,
        funding_stage: fundingStage,
        contact_name: founderName,
        contact_email: email.toLowerCase(),
        contact_title: founderTitle,
        founder_name: founderName,
        founder_title: founderTitle,
        team_size: teamSize,
        pitch_deck_url: pitchDeckUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        status: 'pending',
        call_booked: false,
        platform_access: true,
        onboarding_complete: true,
        onboarding_step: 3,
        access_granted_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (companyError || !newCompany) {
      setError(companyError?.message ?? 'Could not create company.')
      setLoading(false)
      return
    }

    const { error: userError } = await supabase.from('company_users').insert({
      id: uid,
      email: email.toLowerCase(),
      full_name: founderName,
      title: founderTitle,
      company_id: newCompany.id,
    })

    if (userError) {
      setError(userError.message)
      setLoading(false)
      return
    }

    const { error: jobError } = await supabase.from('job_postings').insert({
      company_id: newCompany.id,
      company_name: companyName.trim(),
      company_initial: companyInitial,
      company_stage: fundingStage,
      company_tags: [projectType],
      role_title: `${projectType} Sprint`,
      role_type: mapProjectTypeToRole(projectType),
      lead_engineer_name: founderName,
      lead_engineer_title: reportingTo,
      tech_stack: skills,
      sprint_duration: `${duration} Scope`,
      hours_per_week: hoursNum,
      payout_amount: payoutNum,
      starts_in_days: 7,
      milestone_objective: milestone,
      is_active: false,
      approval_status: 'pending',
      submitted_by: 'company',
      deleted: false,
    })

    if (jobError) {
      setError(jobError.message)
      setLoading(false)
      return
    }

    await supabase.from('notifications').insert({
      type: 'new_company_signup',
      title: 'New founder signed up — sprint scope ready for review',
      body: `${founderName} from ${companyName} submitted a ${projectType} sprint project.`,
      metadata: {
        company_id: newCompany.id,
        company_name: companyName,
      },
    })

    setLoading(false)
    router.push('/company/dashboard')
  }

  return (
    <div className="min-h-screen bg-canvas">
      <CompanyAuthLeftPanel />
      <div className="lg:ml-[50%]">
        <div className="mx-auto max-w-md px-6 py-16">
          {showTesting ? (
            <TestingBanner enabled={testingMode} onChange={setTestingMode} />
          ) : null}

          <div className="mb-8 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${
                  step >= s ? 'bg-blue' : 'bg-line'
                }`}
              />
            ))}
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-navy">
                Create your founder account
              </h1>
              <form onSubmit={handleAccount} className="mt-8 flex flex-col gap-4">
                <input
                  required
                  type="email"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    minLength={8}
                    placeholder="Password (min 8 characters) *"
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
                  <input required type="checkbox" id="terms-co" className="mt-1" />
                  <label htmlFor="terms-co" className="text-sm text-slate">
                    I agree to the Terms and Privacy Policy
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
                  className="rounded-full bg-blue py-3.5 font-bold text-white hover:bg-blue/90 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="mx-auto animate-spin" /> : 'Continue →'}
                </motion.button>
              </form>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h2 className="text-xl font-bold text-navy">
                Tell us about your company
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const err = validateCompanyProfile()
                  if (err) {
                    setError(err)
                    return
                  }
                  setError(null)
                  setStep(3)
                }}
                className="mt-8 flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="First name *"
                    value={founderFirst}
                    onChange={(e) => setFounderFirst(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    required
                    placeholder="Last name *"
                    value={founderLast}
                    onChange={(e) => setFounderLast(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <select
                  required
                  value={founderTitle}
                  onChange={(e) => setFounderTitle(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Founder title *</option>
                  {[
                    'Founder',
                    'Co-Founder',
                    'CEO',
                    'CTO',
                    'Head of Product',
                    'Other',
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  required
                  placeholder="Company name *"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                />
                <select
                  required
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Team size *</option>
                  {['1-5', '6-15', '16-50', '50+'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  required
                  value={fundingStage}
                  onChange={(e) => setFundingStage(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Funding stage *</option>
                  {[
                    'Pre-Seed',
                    'Seed Stage',
                    'Series A',
                    'Series B',
                    'YC',
                    'Bootstrapped',
                    'Other',
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  required
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="url"
                  placeholder="https://linkedin.com/company/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className={inputClass}
                />
                <div>
                  <div className="relative">
                    <Presentation
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/50"
                    />
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... or Notion link"
                      value={pitchDeckUrl}
                      onChange={(e) => setPitchDeckUrl(e.target.value)}
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate/60">
                    Share a deck so we can match you better. Not required.
                  </p>
                </div>
                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}
                <button
                  type="submit"
                  className="rounded-full bg-blue py-3.5 font-bold text-white"
                >
                  Continue →
                </button>
              </form>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h2 className="text-xl font-bold text-navy">
                Define your sprint project
              </h2>
              <p className="mt-1 text-sm text-slate">Step 3 of 3</p>
              <form
                onSubmit={handleFinalSubmit}
                className="mt-8 flex flex-col gap-4"
              >
                <p className="text-sm font-semibold text-navy">Project type *</p>
                <div className="grid grid-cols-2 gap-2">
                  {PROJECT_TYPES.map(({ id, icon: Icon }) => {
                    const selected = projectType === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setProjectType(id)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm ${
                          selected
                            ? 'border-navy bg-navy text-white'
                            : 'border-line bg-white text-slate'
                        }`}
                      >
                        <Icon size={16} />
                        {id}
                      </button>
                    )
                  })}
                </div>

                <div>
                  <p className="text-sm font-semibold text-navy">
                    Required skillsets *
                  </p>
                  {Object.entries(skillCategories).map(([cat, list]) => (
                    <div key={cat} className="mb-3 mt-2">
                      <p className="mb-1 text-xs font-bold text-navy">{cat}</p>
                      <div className="flex flex-wrap gap-2">
                        {list.map((skill) => {
                          const on = skills.includes(skill)
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
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
                    <p className="text-sm text-red-500">Select at least 2 skillsets.</p>
                  ) : null}
                </div>

                <Toggle
                  checked={majorRequired}
                  onChange={setMajorRequired}
                  label="Does this role require a specific major?"
                />
                {majorRequired ? (
                  <input
                    required
                    placeholder="e.g. Computer Science, Business"
                    value={requiredMajor}
                    onChange={(e) => setRequiredMajor(e.target.value)}
                    className={inputClass}
                  />
                ) : null}

                <select
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Sprint duration *</option>
                  {['1 Week', '2 Weeks', '3 Weeks', '4 Weeks', 'Flexible'].map(
                    (d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    )
                  )}
                </select>

                <div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate">
                      $
                    </span>
                    <input
                      required
                      inputMode="numeric"
                      placeholder="e.g. 2000"
                      value={payout}
                      onChange={(e) => setPayout(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate/60">
                    Total stipend paid to the student upon completion
                  </p>
                </div>

                <select
                  required
                  value={reportingTo}
                  onChange={(e) => setReportingTo(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Reporting to *</option>
                  {[
                    'Founder',
                    'Co-Founder',
                    'Head of Engineering',
                    'Head of Marketing',
                    'CEO',
                    'Other',
                  ].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <select
                  required
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Hours per week *</option>
                  {['10 hrs', '15 hrs', '20 hrs'].map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>

                <textarea
                  rows={3}
                  placeholder="Team context, tools used, specific deliverables expected..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  className={inputClass}
                />

                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-blue py-3.5 font-bold text-white disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="mx-auto animate-spin" />
                  ) : (
                    'Submit & Get Matched →'
                  )}
                </motion.button>
              </form>
            </>
          ) : null}

          <p className="mt-6 text-sm text-slate">
            Already have an account?{' '}
            <Link href="/company/login" className="font-semibold text-blue">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
