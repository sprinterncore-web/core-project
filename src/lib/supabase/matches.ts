import { createClient } from './client'
import type { MatchResult } from '@/types/database'
import { DUMMY_MATCHES } from '@/data/dummy-matches'

export async function getMatchesForStudent(
  studentId: string
): Promise<MatchResult[]> {
  const supabase = createClient()

  const { data: realMatches, error } = await supabase
    .from('match_results')
    .select('*, job_posting:job_postings(*)')
    .eq('student_id', studentId)
    .eq('is_visible', true)
    .order('match_score', { ascending: false })

  if (!error && realMatches && realMatches.length > 0) {
    return realMatches as MatchResult[]
  }

  const { data: activeJobs } = await supabase
    .from('job_postings')
    .select('*')
    .eq('is_active', true)
    .eq('approval_status', 'approved')
    .or('deleted.eq.false,deleted.is.null')
    .order('created_at', { ascending: false })

  if (activeJobs && activeJobs.length > 0) {
    return activeJobs.map((job) => ({
      id: `preview-${job.id}`,
      created_at: job.created_at,
      student_id: studentId,
      job_posting_id: job.id,
      match_score: 0,
      match_label: 'PENDING MATCH',
      groq_reasoning: null,
      is_visible: true,
      job_posting: job,
    })) as MatchResult[]
  }

  return DUMMY_MATCHES
}
