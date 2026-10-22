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
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export type CompanyStage =
  | 'Pre-Seed'
  | 'Seed Stage'
  | 'Series A'
  | 'Series B'
  | 'YC W24'
  | 'YC S24'
  | 'Bootstrapped'
  | 'Other'

export interface SkillProof {
  skill: string
  url: string
  label: string
}

export type AvailabilityHours = {
  mon?: number[]
  tue?: number[]
  wed?: number[]
  thu?: number[]
  fri?: number[]
  sat?: number[]
  sun?: number[]
}

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
  deleted: boolean
  deleted_at: string | null
  skill_proofs: SkillProof[]
  availability_hours: AvailabilityHours
  sprint_pitch: string | null
  best_project_url: string | null
  best_project_name: string | null
  resume_url: string | null
  supplemental_interests: string | null
  required_major?: boolean
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
  deleted: boolean
  deleted_at: string | null
  team_size: string | null
  pitch_deck_url: string | null
  linkedin_url: string | null
  funding_stage: string | null
  founder_name: string | null
  founder_title: string | null
  onboarding_complete?: boolean
  onboarding_step?: number
}

export interface University {
  id: number
  name: string
  domain: string | null
  country: string
}

export interface CompanyUser {
  id: string
  created_at: string
  company_id: string | null
  email: string
  full_name: string
  title: string | null
  email_confirmed: boolean
  deleted: boolean
  deleted_at: string | null
}

export interface Notification {
  id: string
  created_at: string
  type: string
  title: string
  body: string | null
  metadata: Record<string, unknown>
  read: boolean
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
  company?: {
    company_name: string
    stage?: string
    pitch_deck_url?: string | null
    contact_name?: string
    founder_name?: string | null
  }
  approval_status: ApprovalStatus
  submitted_by: 'admin' | 'company'
  rejection_reason: string | null
  deleted: boolean
  deleted_at: string | null
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

export type ApplicationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'interview_scheduled'

export interface Application {
  id: string
  created_at: string
  student_id: string
  job_posting_id: string
  company_id: string
  pitch: string
  resume_link: string | null
  proposed_slot_1: string
  proposed_slot_2: string | null
  proposed_slot_3: string | null
  status: ApplicationStatus
  company_response_at: string | null
  decline_reason: string | null
  confirmed_slot: string | null
  deleted: boolean
  job_posting?: JobPosting
  student?: Profile
  company?: Company
}
