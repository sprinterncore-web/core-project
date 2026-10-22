import { createClient } from './client'
import type {
  Admin,
  Application,
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

export async function getAllStudents(
  includeDeleted = false
): Promise<Profile[]> {
  const supabase = createClient()
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (!includeDeleted) {
    query = query.eq('deleted', false)
  }
  const { data } = await query
  return (data ?? []) as Profile[]
}

export async function getAllCompanies(
  includeDeleted = false
): Promise<Company[]> {
  const supabase = createClient()
  let query = supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })
  if (!includeDeleted) {
    query = query.eq('deleted', false)
  }
  const { data } = await query
  return (data ?? []) as Company[]
}

export async function getAllApplications(): Promise<Application[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('applications')
    .select(
      '*, job_posting:job_postings(*), student:profiles(*), company:companies(*)'
    )
    .or('deleted.eq.false,deleted.is.null')
    .order('created_at', { ascending: false })
  return (data ?? []) as Application[]
}

export async function getAllJobPostings(
  includeDeleted = false
): Promise<JobPosting[]> {
  const supabase = createClient()
  let query = supabase
    .from('job_postings')
    .select('*, company:companies(company_name, stage)')
    .order('created_at', { ascending: false })
  if (!includeDeleted) {
    query = query.or('deleted.eq.false,deleted.is.null')
  }
  const { data } = await query
  return (data ?? []) as JobPosting[]
}

export async function softDeleteStudent(
  studentId: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', studentId)
  await supabase.from('match_results').delete().eq('student_id', studentId)
  return { error: error?.message ?? null }
}

export async function restoreStudent(
  studentId: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ deleted: false, deleted_at: null })
    .eq('id', studentId)
  return { error: error?.message ?? null }
}

export async function softDeleteCompany(
  companyId: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const now = new Date().toISOString()
  await supabase
    .from('companies')
    .update({ deleted: true, deleted_at: now })
    .eq('id', companyId)
  await supabase
    .from('job_postings')
    .update({ deleted: true, deleted_at: now })
    .eq('company_id', companyId)
  await supabase
    .from('company_users')
    .update({ deleted: true, deleted_at: now })
    .eq('company_id', companyId)
  return { error: null }
}

export async function restoreCompany(
  companyId: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  await supabase
    .from('companies')
    .update({ deleted: false, deleted_at: null })
    .eq('id', companyId)
  await supabase
    .from('job_postings')
    .update({ deleted: false, deleted_at: null })
    .eq('company_id', companyId)
  await supabase
    .from('company_users')
    .update({ deleted: false, deleted_at: null })
    .eq('company_id', companyId)
  return { error: null }
}

export async function softDeleteJobPosting(
  jobId: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('job_postings')
    .update({
      deleted: true,
      deleted_at: new Date().toISOString(),
      is_active: false,
    })
    .eq('id', jobId)
  return { error: error?.message ?? null }
}

export async function restoreJobPosting(
  jobId: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('job_postings')
    .update({ deleted: false, deleted_at: null })
    .eq('id', jobId)
  return { error: error?.message ?? null }
}

export async function createCompany(
  company: Omit<Company, 'id' | 'created_at' | 'deleted' | 'deleted_at'>
): Promise<{ id: string | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('companies')
    .insert({ ...company, deleted: false, deleted_at: null })
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
    .select(
      '*, company:companies(company_name, pitch_deck_url, contact_name, founder_name)'
    )
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
