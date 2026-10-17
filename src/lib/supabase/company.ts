import { createClient } from './client'
import type { Company, CompanyUser, JobPosting } from '@/types/database'

export async function getCompanyUser(
  userId: string
): Promise<CompanyUser | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('company_users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return data as CompanyUser | null
}

export async function getCompanyById(
  companyId: string
): Promise<Company | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .maybeSingle()
  return data as Company | null
}

export async function getCompanyJobPostings(
  companyId: string
): Promise<JobPosting[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('job_postings')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  return (data ?? []) as JobPosting[]
}

export async function getJobPostingById(
  jobId: string
): Promise<JobPosting | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', jobId)
    .maybeSingle()
  return data as JobPosting | null
}

export async function submitJobPosting(
  job: Omit<
    JobPosting,
    'id' | 'created_at' | 'company' | 'deleted' | 'deleted_at'
  >
): Promise<{ id: string | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('job_postings')
    .insert({
      ...job,
      deleted: false,
      deleted_at: null,
      is_active: false,
      approval_status: 'pending',
      submitted_by: 'company',
    })
    .select('id')
    .single()

  if (!error && data) {
    await supabase.from('notifications').insert({
      type: 'new_job_pending',
      title: 'New job posting pending review',
      body: `${job.company_name} submitted a new ${job.role_title} listing.`,
      metadata: { job_id: data.id, company_id: job.company_id },
    })
  }

  return { id: data?.id ?? null, error: error?.message ?? null }
}

export async function updateCompanyJobPosting(
  id: string,
  updates: Partial<JobPosting>
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('job_postings')
    .update({
      ...updates,
      approval_status: 'pending',
      is_active: false,
      rejection_reason: null,
    })
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function getMatchCountsByJobIds(
  jobIds: string[]
): Promise<Record<string, number>> {
  if (jobIds.length === 0) return {}
  const supabase = createClient()
  const { data } = await supabase
    .from('match_results')
    .select('job_posting_id')
    .in('job_posting_id', jobIds)
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const id = row.job_posting_id as string
    counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}

export async function getJobMatchesWithProfiles(jobId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('match_results')
    .select('*, profile:profiles(full_name, university, major, graduation_year)')
    .eq('job_posting_id', jobId)
    .order('match_score', { ascending: false })
  return data ?? []
}

export async function isCompanyUser(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('company_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  return !!data
}
