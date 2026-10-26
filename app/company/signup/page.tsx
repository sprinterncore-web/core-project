'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Briefcase,
  CalendarCheck,
  Check,
  Code2,
  Loader2,
  Megaphone,
  Palette,
  Rocket,
  Search,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Toggle } from '@/components/ui/Toggle'
import { createClient } from '@/lib/supabase/client'
import { SKILL_CATEGORIES } from '@/data/skills'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-blue focus:ring-2 focus:ring-blue/20'

const PROJECT_TYPES = [
  { id: 'Engineering', icon: Code2 },
  { id: 'Marketing', icon: Megaphone },
  { id: 'Design', icon: Palette },
  { id: 'Growth', icon: TrendingUp },
  { id: 'Student Ambassador', icon: Users },
  { id: 'Research', icon: BookOpen },
  { id: 'Other', icon: Briefcase },
] as const

const CALENDLY_URL = 'https://calendly.com/maguire-sprintern/30min'

function WaitlistLeftPanel() {
  return (
    <div className="fixed inset-y-0 left-0 hidden w-1/2 flex-col bg-gradient-to-br from-navy to-[#0D1F3C] lg:flex">
      <div className="flex h-full flex-col px-12 py-16">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
            <Zap size={20} className="text-white" />
          </span>
          <span className="text-xl font-bold text-white">sprint</span>
          <span className="text-xl font-bold text-teal">ern</span>
        </div>
        <div className="mt-12 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue/15">
          <Rocket size={32} className="text-blue" />
        </div>
        <h2 className="mt-8 text-3xl font-bold text-white">Launch your first sprint</h2>
        <ul className="mt-10 space-y-4">
          {[
            'Get matched with vetted students',
            'Book a personalised intro call',
            'Confirm sprint & launch in days',
          ].map((text) => (
            <li key={text} className="flex items-start gap-3 text-white/80">
              <Check size={18} className="mt-0.5 flex-shrink-0 text-teal" />
              <span className="text-sm">{text}</span>
            </li>
          ))}
        </ul>
        <div className="mx-4 mb-8 mt-auto rounded-2xl bg-white/5 p-5">
          <p className="text-sm italic text-white/70">
            We personally onboard every founding team.
          </p>
          <p className="mt-2 text-xs text-white/40">— Sprintern Team</p>
        </div>
      </div>
    </div>
  )
}

export default function CompanyWaitlistSignupPage() {
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [founderTitle, setFounderTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [website, setWebsite] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [email, setEmail] = useState('')
  const [projectType, setProjectType] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillSearch, setSkillSearch] = useState('')
  const [requiresMajor, setRequiresMajor] = useState(false)
  const [requiredMajor, setRequiredMajor] = useState('')
  const [duration, setDuration] = useState('')
  const [payout, setPayout] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState('')
  const [reportingTo, setReportingTo] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skillWarn, setSkillWarn] = useState(false)

  const skillCategories = useMemo(() => {
    const q = skillSearch.trim().toLowerCase()
    if (!q) return SKILL_CATEGORIES
    const out: Record<string, string[]> = {}
    for (const [cat, list] of Object.entries(SKILL_CATEGORIES)) {
      const filtered = list.filter((s) => s.toLowerCase().includes(q))
      if (filtered.length) out[cat] = filtered
    }
    return out
  }, [skillSearch])

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
    setSkillWarn(false)
  }

  function validateStep1() {
    if (!firstName.trim() || !lastName.trim()) return 'First and last name are required.'
    if (!founderTitle) return 'Founder title is required.'
    if (!companyName.trim()) return 'Company name is required.'
    if (!teamSize) return 'Team size is required.'
    if (!email.trim()) return 'Email is required.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!projectType) {
      setError('Select a project type.')
      return
    }
    if (skills.length < 2) {
      setSkillWarn(true)
      setError('Select at least 2 skillsets.')
      return
    }
    if (requiresMajor && !requiredMajor.trim()) {
      setError('Specify required major.')
      return
    }
    if (!duration || !hoursPerWeek || !reportingTo) {
      setError('Complete all required sprint fields.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const hoursNum = parseInt(hoursPerWeek.replace(/\D/g, ''), 10)

    const { error: insertError } = await supabase.from('company_waitlist').insert({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      founder_title: founderTitle,
      company_name: companyName.trim(),
      team_size: teamSize,
      website: website.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      project_type: projectType,
      skills,
      requires_specific_major: requiresMajor,
      required_major: requiresMajor ? requiredMajor.trim() : null,
      sprint_duration: duration,
      payout_amount: payout ? parseInt(payout.replace(/\D/g, ''), 10) : null,
      hours_per_week: hoursNum,
      reporting_to: reportingTo,
      additional_context: additionalContext.trim() || null,
    })

    if (insertError) {
      setLoading(false)
      if (insertError.code === '23505') {
        setError('This email is already on our waitlist. Check your inbox or contact us.')
      } else {
        setError(insertError.message)
      }
      return
    }

    await supabase.from('notifications').insert({
      type: 'new_company_waitlist',
      title: 'New company booked a call',
      body: `${firstName.trim()} ${lastName.trim()} from ${companyName.trim()} submitted a ${projectType} sprint project.`,
      metadata: { email: email.trim(), company_name: companyName.trim() },
    })

    window.location.href = CALENDLY_URL
  }

  return (
    <div className="min-h-screen bg-canvas">
      <WaitlistLeftPanel />
      <div className="lg:ml-[50%]">
        <div className="mx-auto max-w-md px-6 py-16">
          <div className="relative mb-8 flex rounded-full bg-canvas p-1">
            {['1. Your Info', '2. Sprint Scope'].map((label, i) => {
              const n = i + 1
              const active = step === n
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => n < step && setStep(n)}
                  className={`relative z-10 flex-1 rounded-full py-2 text-center text-xs font-semibold ${
                    active ? 'text-white' : 'text-slate'
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="company-step-pill"
                      className="absolute inset-0 rounded-full bg-blue"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  ) : null}
                  <span className="relative">{label}</span>
                </button>
              )
            })}
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-xl font-bold text-navy">Tell us about your company</h2>
              <p className="mt-1 text-sm text-slate">Step 1 of 2</p>
              <form
                className="mt-6 flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const err = validateStep1()
                  if (err) {
                    setError(err)
                    return
                  }
                  setError(null)
                  setStep(2)
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    className={inputClass}
                    placeholder="First name *"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <input
                    required
                    className={inputClass}
                    placeholder="Last name *"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <select
                  required
                  className={inputClass}
                  value={founderTitle}
                  onChange={(e) => setFounderTitle(e.target.value)}
                >
                  <option value="">Founder title *</option>
                  {[
                    'Founder',
                    'Co-Founder',
                    'CEO',
                    'CTO',
                    'Head of Engineering',
                    'Head of Marketing',
                    'Other',
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  required
                  className={inputClass}
                  placeholder="Company name *"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <select
                  required
                  className={inputClass}
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                >
                  <option value="">Team size *</option>
                  {['1-5', '6-15', '16-50', '50+'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://yourcompany.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://linkedin.com/company/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
                <div>
                  <input
                    required
                    type="email"
                    className={inputClass}
                    placeholder="your@company.com *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-slate/60">
                    We&apos;ll send your confirmation here
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
          ) : (
            <>
              <h2 className="text-xl font-bold text-navy">Define your sprint project</h2>
              <p className="mt-1 text-sm text-slate">Step 2 of 2</p>
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <p className="text-sm font-semibold text-navy">Project type *</p>
                <div className="grid grid-cols-2 gap-2">
                  {PROJECT_TYPES.map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setProjectType(id)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm ${
                        projectType === id
                          ? 'border-navy bg-navy text-white'
                          : 'border-line bg-white text-slate'
                      }`}
                    >
                      <Icon size={16} />
                      {id}
                    </button>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">Required skillsets *</p>
                  <div className="relative mt-2">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/50"
                    />
                    <input
                      className={`${inputClass} pl-9`}
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                    />
                  </div>
                  {Object.entries(skillCategories).map(([cat, list]) => (
                    <div key={cat} className="mt-3">
                      <p className="mb-1 text-xs font-bold text-navy">{cat}</p>
                      <div className="flex flex-wrap gap-2">
                        {list.map((skill) => {
                          const on = skills.includes(skill)
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`rounded-full px-2.5 py-1 text-xs ${
                                on
                                  ? 'bg-navy text-white'
                                  : 'border border-line bg-white text-slate'
                              }`}
                            >
                              {on ? <Check size={10} className="inline" /> : null}{' '}
                              {skill}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {skillWarn ? (
                    <p className="mt-2 text-sm text-red-500">Select at least 2 skillsets.</p>
                  ) : null}
                </div>
                <Toggle
                  checked={requiresMajor}
                  onChange={setRequiresMajor}
                  label="Does this require a specific major?"
                />
                {requiresMajor ? (
                  <input
                    required
                    className={inputClass}
                    placeholder="Which major?"
                    value={requiredMajor}
                    onChange={(e) => setRequiredMajor(e.target.value)}
                  />
                ) : null}
                <select
                  required
                  className={inputClass}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="">Sprint duration *</option>
                  {['1 Week', '2 Weeks', '3 Weeks', '4 Weeks', 'Flexible'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate">
                      $
                    </span>
                    <input
                      inputMode="numeric"
                      className={`${inputClass} pl-8`}
                      placeholder="e.g. 2000"
                      value={payout}
                      onChange={(e) => setPayout(e.target.value)}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate/60">
                    Approximate total stipend for the student
                  </p>
                </div>
                <select
                  required
                  className={inputClass}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                >
                  <option value="">Hours per week *</option>
                  {['10 hrs', '15 hrs', '20 hrs'].map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <select
                  required
                  className={inputClass}
                  value={reportingTo}
                  onChange={(e) => setReportingTo(e.target.value)}
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
                <textarea
                  rows={3}
                  className={inputClass}
                  placeholder="Any other details about the project, tools used, or specific deliverables..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                />
                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-full bg-blue py-3.5 font-bold text-white disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <CalendarCheck size={16} />
                  )}
                  Book Your Call →
                </button>
                <button
                  type="button"
                  className="text-sm text-slate hover:text-navy"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
              </form>
            </>
          )}
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
