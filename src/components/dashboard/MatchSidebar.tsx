'use client'

import { Zap } from 'lucide-react'
import type { Profile } from '@/types/database'

type MatchSidebarProps = {
  profile: Profile | null
  matchCount: number
}

export function MatchSidebar({ profile, matchCount }: MatchSidebarProps) {
  const university =
    profile?.university && profile?.graduation_year
      ? `${profile.university} / '${String(profile.graduation_year).slice(-2)}`
      : profile?.university ?? "UC Berkeley / EECS'28"

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-teal">
            ● LIVE SYNC ACTIVE
          </span>
          <span className="text-xs text-slate">Cohort #47</span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-wash">
            <Zap size={18} className="text-teal" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-navy">
              {matchCount} Curated Matches
            </p>
            <p className="text-xs text-slate">
              Ready for Instant Intro Scheduling
            </p>
          </div>
          <span className="rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold text-white">
            ACTIVE
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5">
        <h3 className="text-lg font-bold text-navy">Student Match Snapshot</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          Your technical profile has completed semantic parsing and
          auto-validation. Startup engineering leads are directly notified.
        </p>

        <ul className="mt-5 flex flex-col gap-3">
          <li className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-sm text-slate">Profile Status</span>
            <span className="text-sm font-semibold text-teal">
              ✓ Verified Student
            </span>
          </li>
          <li className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-sm text-slate">Sprint Term</span>
            <span className="text-sm font-semibold text-navy">
              Spring 2025 Accelerated
            </span>
          </li>
          <li className="flex items-center justify-between pb-0">
            <span className="text-sm text-slate">University</span>
            <span className="text-sm font-semibold text-navy">{university}</span>
          </li>
        </ul>

        <div className="mt-5 border-t border-line pt-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate/50">
            ⚡ SPRINT SCORE
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold text-navy">4.8</span>
            <span className="text-base text-slate">/ 5.0</span>
          </div>
          <div className="mt-2 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="text-teal">
                ⚡
              </span>
            ))}
            <span className="text-line">⚡</span>
          </div>
          <p className="mt-1 text-xs font-bold tracking-wider text-teal">
            OUTSTANDING
          </p>
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-wider text-slate/50">
            CANDIDATE FEEDBACK
          </p>
          <div className="mt-3 rounded-xl bg-teal-wash p-4">
            <p className="text-sm italic leading-relaxed text-navy/80">
              &ldquo;Sprintern matched me with a Series A team in 3 days. I
              shipped their customer webhooks in our two-week sprint.&rdquo;
            </p>
            <p className="mt-3 text-xs font-semibold text-navy">
              — Maya Chen, Sprint Alum
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
