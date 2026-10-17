import { createClient } from './client'
import type {
  Admin,
  Company,
  CompanyUser,
  JobPosting,
  Notification,
  Profile,
} from '@/types/database'

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
    .insert({
      ...job,
      approval_status: job.approval_status ?? 'approved',
      submitted_by: job.submitted_by ?? 'admin',
      rejection_reason: job.rejection_reason ?? null,
    })
    .select('id')
    .single()
  return { id: data?.id ?? null, error: error?.message ?? null }
}

export async function getPendingJobPostings(): Promise<JobPosting[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('job_postings')
    .select('*, company:companies(company_name)')
    .eq('approval_status', 'pending')
    .eq('submitted_by', 'company')
    .order('created_at', { ascending: true })
  return (data ?? []) as JobPosting[]
}

export async function getAdminNotifications(): Promise<Notification[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(20)
  return (data ?? []) as Notification[]
}

export async function getCompanyUsersForLinking(
  companyId: string,
  contactEmail: string
): Promise<CompanyUser[]> {
  const supabase = createClient()
  const { data: linked } = await supabase
    .from('company_users')
    .select('*')
    .eq('company_id', companyId)
  const { data: unlinked } = await supabase
    .from('company_users')
    .select('*')
    .is('company_id', null)
    .ilike('email', contactEmail)
  const byEmail = await supabase
    .from('company_users')
    .select('*')
    .is('company_id', null)
    .eq('email', contactEmail)

  const map = new Map<string, CompanyUser>()
  for (const row of [...(linked ?? []), ...(unlinked ?? []), ...(byEmail.data ?? [])]) {
    map.set(row.id, row as CompanyUser)
  }
  return Array.from(map.values())
}

export async function updateCompanyUser(
  userId: string,
  updates: Partial<CompanyUser>
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('company_users')
    .update(updates)
    .eq('id', userId)
  return { error: error?.message ?? null }
}

export async function linkCompanyUserByEmail(
  email: string,
  companyId: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data, error: findErr } = await supabase
    .from('company_users')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (findErr || !data) {
    return { error: findErr?.message ?? 'No company user found for that email' }
  }
  return updateCompanyUser(data.id, { company_id: companyId })
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
