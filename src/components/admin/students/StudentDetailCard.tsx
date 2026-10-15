'use client'

import type { Profile } from '@/types/database'
import { initials } from '@/lib/format'

export function StudentDetailCard({ profile }: { profile: Profile }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-7">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
          {initials(profile.full_name, profile.email)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-navy">{profile.full_name}</h2>
          <p className="text-sm text-slate">{profile.email}</p>
        </div>
      </div>
    </div>
  )
}
