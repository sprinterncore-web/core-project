/** Where waitlisted students land (profile only). */
export const WAITLIST_PROFILE_URL = '/dashboard/profile?waitlisted=true'

export function isStudentWaitlisted(
  profile: { portal_access?: boolean | null } | null | undefined
): boolean {
  return profile != null && profile.portal_access === false
}
