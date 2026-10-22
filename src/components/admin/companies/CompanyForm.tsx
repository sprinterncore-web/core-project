'use client'

import { useEffect, useState } from 'react'
import { Toggle } from '@/components/ui/Toggle'
import type { Company, CompanyStatus } from '@/types/database'

export type CompanyFormValues = Omit<
  Company,
  'id' | 'created_at' | 'deleted' | 'deleted_at'
>

const STAGES = [
  'Pre-Seed',
  'Seed Stage',
  'Series A',
  'Series B',
  'YC W24',
  'YC S24',
  'Bootstrapped',
  'Other',
]

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10'

type Props = {
  initial?: Partial<Company>
  onSubmit: (values: CompanyFormValues) => Promise<void>
  submitLabel: string
  error?: string | null
}

export function CompanyForm({
  initial,
  onSubmit,
  submitLabel,
  error,
}: Props) {
  const [companyName, setCompanyName] = useState(initial?.company_name ?? '')
  const [initialLetter, setInitialLetter] = useState(
    initial?.company_initial ?? ''
  )
  const [stage, setStage] = useState(initial?.stage ?? 'Seed Stage')
  const [companySize, setCompanySize] = useState(initial?.company_size ?? '')
  const [industry, setIndustry] = useState(initial?.industry ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [website, setWebsite] = useState(initial?.website ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [contactName, setContactName] = useState(initial?.contact_name ?? '')
  const [contactTitle, setContactTitle] = useState(initial?.contact_title ?? '')
  const [contactEmail, setContactEmail] = useState(initial?.contact_email ?? '')
  const [status, setStatus] = useState<CompanyStatus>(
    initial?.status ?? 'pending'
  )
  const [callBooked, setCallBooked] = useState(initial?.call_booked ?? false)
  const [callNotes, setCallNotes] = useState(initial?.call_notes ?? '')
  const [platformAccess, setPlatformAccess] = useState(
    initial?.platform_access ?? false
  )
  const [teamSize, setTeamSize] = useState(initial?.team_size ?? '')
  const [pitchDeckUrl, setPitchDeckUrl] = useState(initial?.pitch_deck_url ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(initial?.linkedin_url ?? '')
  const [fundingStage, setFundingStage] = useState(
    initial?.funding_stage ?? initial?.stage ?? 'Seed Stage'
  )
  const [founderName, setFounderName] = useState(
    initial?.founder_name ?? initial?.contact_name ?? ''
  )
  const [founderTitle, setFounderTitle] = useState(
    initial?.founder_title ?? initial?.contact_title ?? ''
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (companyName && !initial?.company_initial) {
      setInitialLetter(companyName.trim().charAt(0).toUpperCase())
    }
  }, [companyName, initial?.company_initial])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      company_name: companyName,
      company_initial: initialLetter || companyName.charAt(0).toUpperCase(),
      website: website || null,
      industry: industry || null,
      stage,
      company_size: companySize || null,
      location: location || null,
      description: description || null,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_title: contactTitle || null,
      status,
      call_booked: callBooked,
      call_notes: callNotes || null,
      platform_access: platformAccess,
      access_granted_at: platformAccess
        ? new Date().toISOString()
        : initial?.access_granted_at ?? null,
      team_size: teamSize || null,
      pitch_deck_url: pitchDeckUrl.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      funding_stage: fundingStage,
      founder_name: founderName.trim() || null,
      founder_title: founderTitle.trim() || null,
      onboarding_complete: initial?.onboarding_complete ?? true,
      onboarding_step: initial?.onboarding_step ?? 3,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <section>
        <h2 className="mb-4 font-bold text-navy">Company Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            className={inputClass}
            placeholder="Company name *"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <input
            required
            className={inputClass}
            placeholder="Initial *"
            value={initialLetter}
            onChange={(e) => setInitialLetter(e.target.value)}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <select
            className={inputClass}
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
          >
            <option value="">Company size</option>
            {['1-10', '11-50', '51-200', '200+'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <input
          className={`${inputClass} mt-4`}
          placeholder="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <input
          className={`${inputClass} mt-4`}
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className={`${inputClass} mt-4`}
          placeholder="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <textarea
          rows={4}
          className={`${inputClass} mt-4`}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Founder</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            className={inputClass}
            placeholder="Founder name *"
            value={founderName}
            onChange={(e) => {
              setFounderName(e.target.value)
              setContactName(e.target.value)
            }}
          />
          <select
            className={inputClass}
            value={founderTitle}
            onChange={(e) => {
              setFounderTitle(e.target.value)
              setContactTitle(e.target.value)
            }}
          >
            <option value="">Founder title</option>
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
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <select
            className={inputClass}
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
          >
            <option value="">Team size</option>
            {['1-5', '6-15', '16-50', '50+'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={fundingStage}
            onChange={(e) => {
              setFundingStage(e.target.value)
              setStage(e.target.value)
            }}
          >
            {STAGES.concat(['YC', 'Pre-Seed']).filter(
              (s, i, arr) => arr.indexOf(s) === i
            ).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <input
          className={`${inputClass} mt-4`}
          placeholder="Company LinkedIn URL"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
        />
        {pitchDeckUrl ? (
          <a
            href={pitchDeckUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-semibold text-blue"
          >
            View Pitch Deck →
          </a>
        ) : null}
        <input
          className={`${inputClass} mt-2`}
          placeholder="Pitch deck URL"
          value={pitchDeckUrl}
          onChange={(e) => setPitchDeckUrl(e.target.value)}
        />
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Contact Person</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            className={inputClass}
            placeholder="Contact name *"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Contact title"
            value={contactTitle}
            onChange={(e) => setContactTitle(e.target.value)}
          />
        </div>
        <input
          required
          type="email"
          className={`${inputClass} mt-4`}
          placeholder="Contact email *"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
      </section>

      <section>
        <h2 className="mb-4 font-bold text-navy">Onboarding Status</h2>
        <Toggle checked={callBooked} onChange={setCallBooked} label="Call booked?" />
        <textarea
          rows={3}
          className={`${inputClass} mt-4`}
          placeholder="Notes from the intro call..."
          value={callNotes}
          onChange={(e) => setCallNotes(e.target.value)}
        />
        <div className="mt-4">
          <Toggle
            checked={platformAccess}
            onChange={setPlatformAccess}
            label="Platform access?"
            disabled={!callBooked}
          />
        </div>
        <select
          className={`${inputClass} mt-4`}
          value={status}
          onChange={(e) => setStatus(e.target.value as CompanyStatus)}
        >
          <option value="pending">pending</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </section>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-full bg-teal py-3.5 font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  )
}
