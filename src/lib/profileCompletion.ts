import type { Profile } from '@/types/database'

function hasAvailability(hours: Profile['availability_hours']): boolean {
  if (!hours) return false
  return Object.values(hours).some((arr) => arr && arr.length > 0)
}

export function calculateProfileCompletion(profile: Profile | null): number {
  if (!profile) return 0
  let pct = 0

  if (
    profile.full_name &&
    profile.university &&
    profile.major &&
    profile.graduation_year
  ) {
    pct += 15
  }
  if (profile.sprint_pitch?.trim()) pct += 20
  if ((profile.skills?.length ?? 0) >= 5) pct += 15
  if ((profile.skill_proofs?.length ?? 0) > 0) pct += 20
  if (hasAvailability(profile.availability_hours)) pct += 15
  if (profile.github_url?.trim()) pct += 10
  if (profile.linkedin_url?.trim()) pct += 5

  return Math.min(100, pct)
}

export function countAvailabilitySlots(hours: Profile['availability_hours']): number {
  if (!hours) return 0
  return Object.values(hours).reduce((sum, arr) => sum + (arr?.length ?? 0), 0)
}

export function normalizeProfile(p: Profile): Profile {
  return {
    ...p,
    skills: p.skills ?? [],
    skill_proofs: p.skill_proofs ?? [],
    availability_hours: p.availability_hours ?? {},
  }
}
