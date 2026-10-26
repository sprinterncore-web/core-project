import { createClient } from './client'
import type { CompanyWaitlist } from '@/types/database'

export async function getCompanyWaitlist(
  status?: string
): Promise<CompanyWaitlist[]> {
  const supabase = createClient()
  let query = supabase
    .from('company_waitlist')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all' && status !== 'All') {
    query = query.eq('status', status.toLowerCase())
  }

  const { data } = await query
  return (data ?? []) as CompanyWaitlist[]
}

export async function getWaitlistCount(): Promise<number> {
  const supabase = createClient()
  const { count } = await supabase
    .from('company_waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'waitlist')
  return count ?? 0
}

export async function updateWaitlistStatus(
  id: string,
  status: string,
  notes?: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('company_waitlist')
    .update({
      status,
      ...(notes !== undefined ? { notes } : {}),
    })
    .eq('id', id)
  return { error: error?.message ?? null }
}
