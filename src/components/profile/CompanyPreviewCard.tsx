'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { calculateProfileCompletion, countAvailabilitySlots } from '@/lib/profileCompletion'
import { formatDate } from '@/lib/format'
import type { MatchResult, Profile } from '@/types/database'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const BLOCKS = [
  { label: 'AM', hours: [8, 9, 10, 11] },
  { label: 'PM', hours: [12, 13, 14, 15, 16, 17] },
  { label: 'EVE', hours: [18, 19, 20] },
]

type Props = {
  profile: Profile
  matches: MatchResult[]
}

function initials(name: string | null) {
  if (!name) return 'ST'
  const p = name.trim().split(/\s+/)
  if (p.length >= 2) return `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase()
  return p[0].slice(0, 2).toUpperCase()
}

export function CompanyPreviewCard({ profile, matches }: Props) {
  const completionPct = calculateProfileCompletion(profile)
  const totalHours = countAvailabilitySlots(profile.availability_hours)
  const proofs = profile.skill_proofs ?? []
  const scored = matches.filter((m) => m.match_score > 0).slice(0, 3)

  function blockActive(day: (typeof DAYS)[number], blockHours: number[]) {
    const dayHours = profile.availability_hours?.[day] ?? []
    return blockHours.some((h) => dayHours.includes(h))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl"
    >
      <p className="mb-4 text-center text-sm font-medium text-slate/60">
        👁 This is how companies see you
      </p>

      <div className="rounded-3xl border border-line bg-white p-8 shadow-lg">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-navy to-teal-dark text-2xl font-bold text-white">
            {initials(profile.full_name)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy">
              {profile.full_name ?? 'Student'}
            </h2>
            <p className="mt-1 text-base text-slate">
              {profile.university ?? 'University'} · {profile.major ?? 'Major'}{' '}
              · Class of &apos;
              {profile.graduation_year
                ? String(profile.graduation_year).slice(-2)
                : '??'}
              &apos;
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.role_type ? (
                <span className="rounded-full border border-blue/20 bg-blue/10 px-3 py-1 text-xs font-semibold capitalize text-blue">
                  {profile.role_type}
                </span>
              ) : null}
              <span className="rounded-full border border-teal/20 bg-teal-wash px-3 py-1 text-xs font-semibold text-teal">
                {profile.hours_per_week ?? 0} hrs/week
              </span>
              <span className="rounded-full border border-teal/20 bg-teal-wash px-3 py-1 text-xs font-semibold text-teal">
                Available {totalHours}hrs/wk
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-canvas p-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate/40">
            Sprint pitch
          </p>
          <p className="text-base leading-relaxed text-navy">
            {profile.sprint_pitch?.trim() ? (
              profile.sprint_pitch
            ) : (
              <span className="italic text-slate/40">
                No sprint pitch added yet.
              </span>
            )}
          </p>
          {profile.best_project_name ? (
            <div className="mt-3 flex items-center gap-2">
              <ExternalLink size={14} className="text-blue" />
              <a
                href={profile.best_project_url ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-blue hover:underline"
              >
                {profile.best_project_name}
              </a>
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate/40">
            Verified stack
          </p>
          <div className="flex flex-wrap gap-2">
            {(profile.skills ?? []).map((skill) => {
              const proof = proofs.find((p) => p.skill === skill)
              if (proof?.url) {
                return (
                  <a
                    key={skill}
                    href={proof.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-sm text-white transition-all hover:bg-navy/90"
                  >
                    {skill}
                    <ExternalLink
                      size={11}
                      className="opacity-60 group-hover:opacity-100"
                    />
                  </a>
                )
              }
              return (
                <span
                  key={skill}
                  className="rounded-full border border-line bg-canvas px-3 py-1.5 text-sm text-navy"
                >
                  {skill}
                </span>
              )
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate/40">
            Availability
          </p>
          <div className="grid grid-cols-8 gap-1">
            <div />
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={`${d}-${i}`} className="text-center text-[9px] text-slate/40">
                {d}
              </div>
            ))}
            {BLOCKS.map((block) => (
              <div key={block.label} className="contents">
                <div className="flex items-center text-[9px] text-slate/40">
                  {block.label}
                </div>
                {DAYS.map((day) => (
                  <div
                    key={`${block.label}-${day}`}
                    className={`h-8 w-8 rounded-md ${
                      blockActive(day, block.hours) ? 'bg-teal' : 'bg-canvas'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {scored.length > 0 ? (
          <div className="mt-6">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate/40">
              Current sprint matches
            </p>
            {scored.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 border-b border-line py-2 last:border-0"
              >
                <span className="flex-1 text-sm font-semibold text-navy">
                  {m.job_posting?.company_name ?? 'Company'}
                </span>
                <span className="rounded-full bg-teal-wash px-2.5 py-1 text-xs font-bold text-teal">
                  {m.match_score}%
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between border-t border-line pt-6">
          <div>
            <p className="text-sm text-slate">
              Profile strength: {completionPct}%
            </p>
            <div className="mt-1 h-1.5 w-24 rounded-full bg-line">
              <div
                className="h-1.5 rounded-full bg-teal"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate/50">
            Last updated {formatDate(profile.created_at)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
