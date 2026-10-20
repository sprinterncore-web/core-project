import { createClient } from './client'
import type { Application, ApplicationStatus } from '@/types/database'

export async function getStudentApplications(
  studentId: string
): Promise<Application[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('applications')
    .select('*, job_posting:job_postings(*), company:companies(*)')
    .eq('student_id', studentId)
    .or('deleted.eq.false,deleted.is.null')
    .order('created_at', { ascending: false })
  return (data ?? []) as Application[]
}

export async function getCompanyApplications(
  companyId: string
): Promise<Application[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('applications')
    .select('*, job_posting:job_postings(*), student:profiles(*)')
    .eq('company_id', companyId)
    .or('deleted.eq.false,deleted.is.null')
    .order('created_at', { ascending: false })
  return (data ?? []) as Application[]
}

export async function submitApplication(
  application: Omit<
    Application,
    | 'id'
    | 'created_at'
    | 'status'
    | 'company_response_at'
    | 'decline_reason'
    | 'confirmed_slot'
    | 'deleted'
    | 'job_posting'
    | 'student'
    | 'company'
  >
): Promise<{ id: string | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .insert({ ...application, status: 'pending' })
    .select('id')
    .single()
  return { id: data?.id ?? null, error: error?.message ?? null }
}

export async function checkExistingApplication(
  studentId: string,
  jobPostingId: string
): Promise<Application | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('applications')
    .select('*')
    .eq('student_id', studentId)
    .eq('job_posting_id', jobPostingId)
    .or('deleted.eq.false,deleted.is.null')
    .maybeSingle()
  return data as Application | null
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  extras: {
    confirmed_slot?: string
    decline_reason?: string
  } = {}
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('applications')
    .update({
      status,
      company_response_at: new Date().toISOString(),
      ...extras,
    })
    .eq('id', applicationId)
  return { error: error?.message ?? null }
}

export async function withdrawApplication(
  applicationId: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('applications')
    .update({ deleted: true })
    .eq('id', applicationId)
  return { error: error?.message ?? null }
}

export async function getScheduledInterviews(
  studentId: string
): Promise<Application[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('applications')
    .select('*, job_posting:job_postings(*), company:companies(*)')
    .eq('student_id', studentId)
    .eq('status', 'interview_scheduled')
    .or('deleted.eq.false,deleted.is.null')
    .order('confirmed_slot', { ascending: true })
  return (data ?? []) as Application[]
}

export async function countPendingApplications(
  studentId: string
): Promise<number> {
  const supabase = createClient()
  const { count } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('status', 'pending')
    .or('deleted.eq.false,deleted.is.null')
  return count ?? 0
}
