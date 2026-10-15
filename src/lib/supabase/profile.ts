import { createClient } from './client'
import type { Profile } from '@/types/database'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as Profile
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  return { error: error?.message ?? null }
}

export async function completeOnboardingStep(
  userId: string,
  step: number,
  data: Partial<Profile>
): Promise<{ error: string | null }> {
  return updateProfile(userId, {
    ...data,
    onboarding_step: step,
    ...(step === 4 ? { onboarding_complete: true } : {}),
  })
}
