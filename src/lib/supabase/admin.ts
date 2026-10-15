import { createClient } from './client'
import type { Admin, Company, JobPosting, Profile } from '@/types/database'

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('admins')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  return !!data
}

export async function getAllStudents(): Promise<Profile[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Profile[]
}

export async function getAllCompanies(): Promise<Company[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Company[]
}

export async function getAllJobPostings(): Promise<JobPosting[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('job_postings')
    .select('*, company:companies(company_name, stage)')
    .order('created_at', { ascending: false })
  return (data ?? []) as JobPosting[]
}

export async function createCompany(
  company: Omit<Company, 'id' | 'created_at'>
): Promise<{ id: string | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('companies')
    .insert(company)
    .select('id')
    .single()
  return { id: data?.id ?? null, error: error?.message ?? null }
}

export async function updateCompany(
  id: string,
  updates: Partial<Company>
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from('companies').update(updates).eq('id', id)
  return { error: error?.message ?? null }
}

export async function createJobPosting(
  job: Omit<JobPosting, 'id' | 'created_at' | 'company'>
): Promise<{ id: string | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('job_postings')
    .insert(job)
    .select('id')
    .single()
  return { id: data?.id ?? null, error: error?.message ?? null }
}

export async function updateJobPosting(
  id: string,
  updates: Partial<JobPosting>
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('job_postings')
    .update(updates)
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function deleteJobPosting(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('job_postings')
    .update({ is_active: false })
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function getStudentMatches(studentId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('match_results')
    .select('*, job_posting:job_postings(*)')
    .eq('student_id', studentId)
    .order('match_score', { ascending: false })
  return data ?? []
}

export async function getJobMatches(jobId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('match_results')
    .select('*, profile:profiles(full_name, university, email)')
    .eq('job_posting_id', jobId)
    .order('match_score', { ascending: false })
  return data ?? []
}

export async function getMatchCountsByJob(): Promise<Record<string, number>> {
  const supabase = createClient()
  const { data } = await supabase.from('match_results').select('job_posting_id')
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const id = row.job_posting_id as string
    counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}
