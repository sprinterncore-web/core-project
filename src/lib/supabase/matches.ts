import { createClient } from './client'
import type { MatchResult } from '@/types/database'
import { DUMMY_MATCHES } from '@/data/dummy-matches'

export async function getMatchesForStudent(
  studentId: string
): Promise<MatchResult[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('match_results')
    .select(
      `
    *,
    job_posting:job_postings(*)
  `
    )
    .eq('student_id', studentId)
    .eq('is_visible', true)
    .order('match_score', { ascending: false })

  if (error || !data || data.length === 0) {
    return DUMMY_MATCHES
  }

  return data as MatchResult[]
}
