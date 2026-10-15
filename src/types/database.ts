export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type RoleType = 'developer' | 'designer' | 'growth' | 'data'
export type ProfileStatus = 'pending' | 'verified' | 'active'
export type Availability = 'immediate' | '2weeks' | 'nextmonth'
export type CompanyStatus = 'pending' | 'active' | 'inactive'
export type CompanyStage =
  | 'Pre-Seed'
  | 'Seed Stage'
  | 'Series A'
  | 'Series B'
  | 'YC W24'
  | 'YC S24'
  | 'Bootstrapped'
  | 'Other'

export interface Profile {
  id: string
  created_at: string
  email: string
  full_name: string | null
  university: string | null
  graduation_year: number | null
  major: string | null
  linkedin_url: string | null
  github_url: string | null
  personal_site: string | null
  bio: string | null
  skills: string[]
  role_type: RoleType | null
  hours_per_week: number | null
  availability: Availability | null
  avatar_url: string | null
  onboarding_complete: boolean
  onboarding_step: number
  sprint_score: number
  profile_status: ProfileStatus
}

export interface Company {
  id: string
  created_at: string
  company_name: string
  company_initial: string
  website: string | null
  industry: string | null
  stage: string
  company_size: string | null
  location: string | null
  description: string | null
  contact_name: string
  contact_email: string
  contact_title: string | null
  status: CompanyStatus
  call_booked: boolean
  call_notes: string | null
  platform_access: boolean
  access_granted_at: string | null
}

export interface Admin {
  id: string
  created_at: string
  email: string
  full_name: string | null
  role: 'admin' | 'super_admin'
}

export interface JobPosting {
  id: string
  created_at: string
  company_name: string
  company_initial: string
  company_stage: string
  company_tags: string[]
  role_title: string
  lead_engineer_name: string
  lead_engineer_title: string
  payout_amount: number
  sprint_duration: string
  hours_per_week: number
  milestone_objective: string
  tech_stack: string[]
  starts_in_days: number
  is_active: boolean
  role_type: RoleType
  company_id?: string | null
  notes?: string | null
  created_by?: string | null
  company?: { company_name: string; stage: string }
}

export interface MatchResult {
  id: string
  created_at: string
  student_id: string
  job_posting_id: string
  match_score: number
  match_label: string
  groq_reasoning: string | null
  is_visible: boolean
  job_posting?: JobPosting
}
