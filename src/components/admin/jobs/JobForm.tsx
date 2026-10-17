'use client'

import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { SKILL_CATEGORIES } from '@/data/skills'
import { Toggle } from '@/components/ui/Toggle'
import type { Company, JobPosting, RoleType } from '@/types/database'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10'

type JobFormValues = Omit<JobPosting, 'id' | 'created_at' | 'company'>

type Props = {
  companies: Company[]
  initial?: Partial<JobPosting>
  defaultCompanyId?: string
  onSubmit: (values: JobFormValues) => Promise<void>
  submitLabel: string
  error?: string | null
}

export function JobForm({
  companies,
  initial,
  defaultCompanyId,
  onSubmit,
  submitLabel,
  error,
}: Props) {
  const [companyId, setCompanyId] = useState(
    initial?.company_id ?? defaultCompanyId ?? ''
  )
  const [roleTitle, setRoleTitle] = useState(initial?.role_title ?? '')
  const [roleType, setRoleType] = useState<RoleType>(
    initial?.role_type ?? 'developer'
  )
  const [leadName, setLeadName] = useState(initial?.lead_engineer_name ?? '')
  const [leadTitle, setLeadTitle] = useState(initial?.lead_engineer_title ?? '')
  const [payout, setPayout] = useState(String(initial?.payout_amount ?? ''))
  const [duration, setDuration] = useState(
    initial?.sprint_duration ?? '2-Week Scope'
  )
  const [hours, setHours] = useState(String(initial?.hours_per_week ?? '15'))
  const [startsIn, setStartsIn] = useState(String(initial?.starts_in_days ?? '3'))
  const [milestone, setMilestone] = useState(initial?.milestone_objective ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    initial?.tech_stack ?? []
  )
  const [tags, setTags] = useState<string[]>(
    initial?.company_tags?.length ? initial.company_tags : ['', '', '']
  )
  const [skillSearch, setSkillSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedCompany = companies.find((c) => c.id === companyId)

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
    if (!companyId || selectedSkills.length < 2) return
    setSaving(true)
    const company = companies.find((c) => c.id === companyId)!
    await onSubmit({
      company_id: companyId,
      company_name: company.company_name,
      company_initial: company.company_initial,
      company_stage: company.stage,
      company_tags: tags.filter(Boolean),
      role_title: roleTitle,
      role_type: roleType,
      lead_engineer_name: leadName,
      lead_engineer_title: leadTitle,
      payout_amount: parseInt(payout, 10),
      sprint_duration: duration,
      hours_per_week: parseInt(hours, 10),
      starts_in_days: parseInt(startsIn, 10),
      milestone_objective: milestone,
      tech_stack: selectedSkills,
      is_active: isActive,
      notes: notes || null,
      created_by: initial?.created_by ?? null,
      approval_status: 'approved',
      submitted_by: 'admin',
      rejection_reason: null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <section>
        <h2 className="mb-4 font-bold text-navy">Company</h2>
        <select
          required
          className={inputClass}
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option value="">Select company *</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company_name} · {c.stage}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Role Details</h2>
        <input
          required
          className={inputClass}
          placeholder="Role title *"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
        />
        <select
          className={`${inputClass} mt-4`}
          value={roleType}
          onChange={(e) => setRoleType(e.target.value as RoleType)}
        >
          {['developer', 'designer', 'growth', 'data'].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <div className="mt-4 grid grid-cols-2 gap-4">
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
            placeholder="Lead engineer title *"
            value={leadTitle}
            onChange={(e) => setLeadTitle(e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Sprint Details</h2>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate">
            $
          </span>
          <input
            required
            type="number"
            className={`${inputClass} pl-8`}
            placeholder="3200"
            value={payout}
            onChange={(e) => setPayout(e.target.value)}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <select
            className={inputClass}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            {[
              '1-Week Scope',
              '2-Week Scope',
              '3-Week Scope',
              '4-Week Scope',
            ].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          >
            {['10', '12', '15', '16', '20'].map((h) => (
              <option key={h} value={h}>
                {h} hrs/wk
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            className={inputClass}
            placeholder="Starts in days"
            value={startsIn}
            onChange={(e) => setStartsIn(e.target.value)}
          />
        </div>
        <p className="mt-2 text-xs text-slate">
          Number of days from today this sprint starts
        </p>
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Required Tech Stack</h2>
        <input
          className={`${inputClass} mb-4`}
          placeholder="Search skills..."
          value={skillSearch}
          onChange={(e) => setSkillSearch(e.target.value)}
        />
        {Object.entries(filteredSkills).map(([cat, skills]) => (
          <div key={cat} className="mb-4">
            <p className="mb-2 text-sm font-bold text-navy">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const on = selectedSkills.includes(skill)
                return (
                  <motion.button
                    key={skill}
                    type="button"
                    layout
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSkill(skill)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${
                      on
                        ? 'bg-navy text-white'
                        : 'border border-line bg-white text-slate'
                    }`}
                  >
                    {on ? <Check size={12} /> : null}
                    {skill}
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
        {selectedSkills.length < 2 ? (
          <p className="text-sm text-red-500">Select at least 2 skills</p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Company Tags</h2>
        {tags.map((tag, i) => (
          <input
            key={i}
            className={`${inputClass} mb-2`}
            placeholder={`Tag ${i + 1}`}
            value={tag}
            onChange={(e) => {
              const next = [...tags]
              next[i] = e.target.value
              setTags(next)
            }}
          />
        ))}
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Sprint Milestone Objective *</h2>
        <textarea
          required
          maxLength={500}
          rows={5}
          className={inputClass}
          value={milestone}
          onChange={(e) => setMilestone(e.target.value)}
          placeholder="Describe what the student will build..."
        />
        <p className="mt-1 text-right text-xs text-slate/50">
          {milestone.length} / 500
        </p>
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Internal Notes</h2>
        <textarea
          rows={3}
          className={inputClass}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Context from the company call..."
        />
      </section>

      <section>
        <Toggle checked={isActive} onChange={setIsActive} label="Active listing?" />
        <p className="mt-2 text-xs text-slate">
          Active listings are shown to matched students
        </p>
      </section>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex items-center justify-between">
        <a href="/admin/jobs" className="text-sm text-slate hover:text-navy">
          Cancel
        </a>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-teal px-8 py-3.5 font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
