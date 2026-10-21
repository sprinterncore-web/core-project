import { groq } from './client'
import type { JobPosting, Profile, SkillProof } from '@/types/database'

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
- Sprint Pitch: ${profile.sprint_pitch ?? profile.bio ?? 'Not provided'}
- Best Project: ${profile.best_project_name ?? 'Not provided'}
  URL: ${profile.best_project_url ?? 'Not provided'}
- Verified skill proofs: ${
    (profile.skill_proofs?.length ?? 0) > 0
      ? profile.skill_proofs
          .map((p: SkillProof) => `${p.skill} (${p.label})`)
          .join(', ')
      : 'None'
  }
- GitHub: ${profile.github_url ?? 'Not linked'}
- LinkedIn: ${profile.linkedin_url ?? 'Not linked'}

JOB POSTING:
- Company: ${job.company_name} (${job.company_stage})
- Role: ${job.role_title}
- Required Stack: ${job.tech_stack?.join(', ')}
- Sprint Duration: ${job.sprint_duration}
- Hours per week: ${job.hours_per_week}
- Milestone: ${job.milestone_objective}
- Role Type: ${job.role_type}

SCORING CRITERIA:
1. Stack overlap (40%): How many required skills does the student have?
2. Availability match (20%): Does their hours/week match the sprint?
3. Experience signals (20%): Proof links, GitHub, project quality
4. Role fit (20%): Does their role type match the posting?

A student with matching skills AND proof links scores 10-15 points
higher than one with matching skills but no proof.

Respond with ONLY valid JSON, nothing else:
{
  "score": <number 0-100>,
  "label": "<2-3 word label: STACK FIT / STRONG MATCH / PARTIAL FIT / LOW FIT>",
  "reasoning": "<2-3 sentences explaining the score>"
}`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
    max_tokens: 256,
  })

  const content = completion.choices[0]?.message?.content ?? '{}'
  const cleaned = content.replace(/^```json\s*|\s*```$/g, '').trim()

  try {
    const result = JSON.parse(cleaned)
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
