import { groq } from './client'
import type { JobPosting, Profile } from '@/types/database'

export async function generateMatchScore(
  profile: Profile,
  job: JobPosting
): Promise<{ score: number; reasoning: string; label: string }> {
  const prompt = `You are a technical recruiter AI for Sprintern, 
  a student-startup sprint matchmaking platform.

  Analyze this student profile against this job posting and return 
  a match score from 0-100.

  STUDENT PROFILE:
  - Name: ${profile.full_name}
  - University: ${profile.university}
  - Major: ${profile.major}
  - Graduation Year: ${profile.graduation_year}
  - Role Type: ${profile.role_type}
  - Skills: ${profile.skills?.join(', ')}
  - Hours available per week: ${profile.hours_per_week}
  - Availability: ${profile.availability}
  - Bio: ${profile.bio}

  JOB POSTING:
  - Company: ${job.company_name} (${job.company_stage})
  - Role: ${job.role_title}
  - Required Stack: ${job.tech_stack?.join(', ')}
  - Sprint Duration: ${job.sprint_duration}
  - Hours per week: ${job.hours_per_week}
  - Milestone: ${job.milestone_objective}
  - Role Type: ${job.role_type}

  Respond with ONLY valid JSON in this exact format, nothing else:
  {
    "score": <number 0-100>,
    "label": "<2-3 word match label like STACK FIT or STRONG MATCH>",
    "reasoning": "<2-3 sentence explanation of why this student matches or doesn't match>"
  }`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama3-8b-8192',
    temperature: 0.3,
    max_tokens: 256,
  })

  const content = completion.choices[0]?.message?.content ?? '{}'

  try {
    const result = JSON.parse(content)
    return {
      score: Math.min(100, Math.max(0, result.score ?? 0)),
      label: result.label ?? 'MATCH',
      reasoning: result.reasoning ?? '',
    }
  } catch {
    return { score: 0, label: 'ERROR', reasoning: 'Failed to parse match score' }
  }
}

export async function generateAllMatchesForStudent(
  profile: Profile,
  jobs: JobPosting[]
): Promise<
  Array<{
    job_posting_id: string
    match_score: number
    match_label: string
    groq_reasoning: string
  }>
> {
  const results = await Promise.all(
    jobs.map(async (job) => {
      const match = await generateMatchScore(profile, job)
      return {
        job_posting_id: job.id,
        match_score: match.score,
        match_label: match.label,
        groq_reasoning: match.reasoning,
      }
    })
  )

  return results.sort((a, b) => b.match_score - a.match_score)
}
