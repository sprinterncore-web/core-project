'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { SKILL_CATEGORIES } from '@/data/skills'
import type { JobPosting, RoleType } from '@/types/database'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10'

type Props = {
  initialData?: Partial<JobPosting>
  companyId: string
  companyName: string
  companyInitial: string
  companyStage: string
  onSubmit: (data: Omit<JobPosting, 'id' | 'created_at' | 'company'>) => Promise<void>
  isLoading: boolean
  submitLabel: string
  cancelHref?: string
}

export function JobPostingForm({
  initialData,
  companyId,
  companyName,
  companyInitial,
  companyStage,
  onSubmit,
  isLoading,
  submitLabel,
  cancelHref = '/company/jobs',
}: Props) {
  const [roleTitle, setRoleTitle] = useState(initialData?.role_title ?? '')
  const [roleType, setRoleType] = useState<RoleType>(
    initialData?.role_type ?? 'developer'
  )
  const [leadName, setLeadName] = useState(initialData?.lead_engineer_name ?? '')
  const [leadTitle, setLeadTitle] = useState(
    initialData?.lead_engineer_title ?? ''
  )
  const [payout, setPayout] = useState(
    String(initialData?.payout_amount ?? '')
  )
  const [duration, setDuration] = useState(
    initialData?.sprint_duration ?? '2-Week Scope'
  )
  const [hours, setHours] = useState(String(initialData?.hours_per_week ?? '15'))
  const [startsIn, setStartsIn] = useState(
    String(initialData?.starts_in_days ?? '3')
  )
  const [milestone, setMilestone] = useState(
    initialData?.milestone_objective ?? ''
  )
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    initialData?.tech_stack ?? []
  )
  const [tags, setTags] = useState<string[]>(
    initialData?.company_tags?.length
      ? [...initialData.company_tags, '', '', ''].slice(0, 3)
      : ['', '', '']
  )
  const [skillSearch, setSkillSearch] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const filteredSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase()
    if (!q) return SKILL_CATEGORIES
    const out: Record<string, string[]> = {}
    for (const [cat, list] of Object.entries(SKILL_CATEGORIES)) {
      const f = list.filter((s) => s.toLowerCase().includes(q))
      if (f.length) out[cat] = f
    }
    return out
  }, [skillSearch])

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!roleTitle.trim()) {
      setFormError('Role title is required.')
      return
    }
    if (selectedSkills.length < 2) {
      setFormError('Select at least 2 skills.')
      return
    }
    if (milestone.trim().length < 100) {
      setFormError('Milestone objective must be at least 100 characters.')
      return
    }
    if (milestone.length > 600) {
      setFormError('Milestone objective must be 600 characters or less.')
      return
    }

    await onSubmit({
      company_id: companyId,
      company_name: companyName,
      company_initial: companyInitial,
      company_stage: companyStage,
      company_tags: tags.filter(Boolean),
      role_title: roleTitle.trim(),
      role_type: roleType,
      lead_engineer_name: leadName.trim(),
      lead_engineer_title: leadTitle.trim(),
      payout_amount: parseInt(payout, 10),
      sprint_duration: duration,
      hours_per_week: parseInt(hours, 10),
      starts_in_days: parseInt(startsIn, 10),
      milestone_objective: milestone.trim(),
      tech_stack: selectedSkills,
      is_active: false,
      approval_status: 'pending',
      submitted_by: 'company',
      rejection_reason: null,
      notes: initialData?.notes ?? null,
      created_by: initialData?.created_by ?? null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <section className="rounded-xl border border-line bg-canvas/50 p-4 text-sm text-slate">
        <p className="font-semibold text-navy">{companyName}</p>
        <p className="text-xs text-slate/70">
          {companyInitial} · {companyStage} — company details are managed by
          Sprintern
        </p>
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Role Details</h2>
        <input
          required
          className={inputClass}
          placeholder="e.g. Founding Engineer, Full-Stack Developer"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
        />
        <select
          className={`${inputClass} mt-4`}
          value={roleType}
          onChange={(e) => setRoleType(e.target.value as RoleType)}
        >
          <option value="developer">Developer</option>
          <option value="designer">Designer</option>
          <option value="growth">Growth</option>
          <option value="data">Data</option>
        </select>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            required
            className={inputClass}
            placeholder="Lead engineer name *"
            value={leadName}
            onChange={(e) => setLeadName(e.target.value)}
          />
          <input
            required
            className={inputClass}
            placeholder="e.g. CTO, Head of Engineering"
            value={leadTitle}
            onChange={(e) => setLeadTitle(e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Sprint Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate">
              $
            </span>
            <input
              required
              type="number"
              min={0}
              className={`${inputClass} pl-8`}
              placeholder="Payout amount"
              value={payout}
              onChange={(e) => setPayout(e.target.value)}
            />
          </div>
          <select
            required
            className={inputClass}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            {['1-Week Scope', '2-Week Scope', '3-Week Scope', '4-Week Scope'].map(
              (d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              )
            )}
          </select>
          <select
            required
            className={inputClass}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          >
            {['10', '12', '15', '16', '20'].map((h) => (
              <option key={h} value={h}>
                {h} hrs/week
              </option>
            ))}
          </select>
          <div>
            <input
              required
              type="number"
              min={0}
              className={inputClass}
              placeholder="Starts in (days)"
              value={startsIn}
              onChange={(e) => setStartsIn(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate/60">
              How many days from today can this sprint start?
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Tech Stack</h2>
        <input
          className={inputClass}
          placeholder="Search skills..."
          value={skillSearch}
          onChange={(e) => setSkillSearch(e.target.value)}
        />
        <div className="mt-4 max-h-64 space-y-4 overflow-y-auto">
          {Object.entries(filteredSkills).map(([cat, skills]) => (
            <div key={cat}>
              <p className="mb-2 text-xs font-bold uppercase text-slate/50">
                {cat}
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const on = selectedSkills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        on
                          ? 'bg-blue text-white'
                          : 'border border-line bg-white text-navy hover:border-blue'
                      }`}
                    >
                      {skill}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Company Tags</h2>
        <div className="space-y-2">
          {tags.map((tag, i) => (
            <input
              key={i}
              className={inputClass}
              placeholder="e.g. LLM Tooling, DevTools, B2B SaaS"
              value={tag}
              onChange={(e) => {
                const next = [...tags]
                next[i] = e.target.value
                setTags(next)
              }}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Sprint Milestone Objective *</h2>
        <textarea
          required
          rows={6}
          maxLength={600}
          className={inputClass}
          placeholder="Describe exactly what the student will build..."
          value={milestone}
          onChange={(e) => setMilestone(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate/60">
          {milestone.length} / 600 (min 100 characters)
        </p>
      </section>

      {formError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      <div className="mt-10 flex items-center justify-between">
        <Link
          href={cancelHref}
          className="text-sm font-medium text-slate hover:text-navy"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-full bg-blue px-8 py-3.5 font-bold text-white hover:bg-blue/90 disabled:opacity-70"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
