import { createClient } from '@/lib/supabase/server'
import {
  generateAllMatchesForStudent,
  generateMatchScore,
} from '@/lib/groq/match'
import type { JobPosting, Profile } from '@/types/database'
import { NextResponse } from 'next/server'

async function isAdminUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data } = await supabase
    .from('admins')
    .select('id')
    .eq('id', userId)
    .single()
  return !!data
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json().catch(() => ({}))
    const targetStudentId = body.studentId ?? null
    const targetJobId = body.jobId ?? null

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (targetStudentId) {
      if (!(await isAdminUser(supabase, user.id))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetStudentId)
        .single()

      if (!profile || profileError) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      const { data: jobs, error: jobsError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('is_active', true)

      if (!jobs || jobsError) {
        return NextResponse.json({ error: 'No jobs found' }, { status: 404 })
      }

      const matches = await generateAllMatchesForStudent(
        profile as Profile,
        jobs as JobPosting[]
      )

      const matchRows = matches.map((m) => ({
        student_id: targetStudentId,
        job_posting_id: m.job_posting_id,
        match_score: m.match_score,
        match_label: m.match_label,
        groq_reasoning: m.groq_reasoning,
        is_visible: true,
      }))

      const { error: upsertError } = await supabase
        .from('match_results')
        .upsert(matchRows, { onConflict: 'student_id,job_posting_id' })

      if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        matches_generated: matches.length,
        top_match_score: matches[0]?.match_score ?? 0,
      })
    }

    if (targetJobId) {
      if (!(await isAdminUser(supabase, user.id))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const { data: job, error: jobError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', targetJobId)
        .single()

      if (!job || jobError) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }

      const { data: profiles } = await supabase.from('profiles').select('*')

      let generated = 0
      for (const profile of (profiles ?? []) as Profile[]) {
        const match = await generateMatchScore(profile, job as JobPosting)
        await supabase.from('match_results').upsert(
          {
            student_id: profile.id,
            job_posting_id: targetJobId,
            match_score: match.score,
            match_label: match.label,
            groq_reasoning: match.reasoning,
            is_visible: true,
          },
          { onConflict: 'student_id,job_posting_id' }
        )
        generated++
      }

      return NextResponse.json({
        success: true,
        matches_generated: generated,
      })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: jobs, error: jobsError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('is_active', true)

    if (!jobs || jobsError) {
      return NextResponse.json({ error: 'No jobs found' }, { status: 404 })
    }

    const matches = await generateAllMatchesForStudent(
      profile as Profile,
      jobs as JobPosting[]
    )

    const matchRows = matches.map((m) => ({
      student_id: user.id,
      job_posting_id: m.job_posting_id,
      match_score: m.match_score,
      match_label: m.match_label,
      groq_reasoning: m.groq_reasoning,
      is_visible: true,
    }))

    const { error: upsertError } = await supabase
      .from('match_results')
      .upsert(matchRows, { onConflict: 'student_id,job_posting_id' })

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      matches_generated: matches.length,
      top_match_score: matches[0]?.match_score ?? 0,
    })
  } catch (error) {
    console.error('Match generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
