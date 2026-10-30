import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WAITLIST_PROFILE_URL } from '@/lib/portal-access'

/** Server-side gate for Matches / Applications (middleware backup). */
export async function enforceStudentPortalAccess(userId: string): Promise<void> {
  const supabase = await createClient()

  const { data: companyUser } = await supabase
    .from('company_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (companyUser) return

  const { data: adminRow } = await supabase
    .from('admins')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (adminRow) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('portal_access')
    .eq('id', userId)
    .maybeSingle()

  if (profile?.portal_access !== true) {
    redirect(WAITLIST_PROFILE_URL)
  }
}
