/** Where waitlisted students land (profile only). */
export const WAITLIST_PROFILE_URL = '/dashboard/profile?waitlisted=true'

export function isStudentWaitlisted(
  profile: { portal_access?: boolean | null } | null | undefined
): boolean {
  // Only explicit true passes; false, null, undefined, or missing profile block.
  return profile?.portal_access !== true
}
