import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { enforceStudentPortalAccess } from '@/lib/supabase/portal-gate.server'
import ApplicationsClient from './ApplicationsClient'

export default async function StudentApplicationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  await enforceStudentPortalAccess(user.id)

  return <ApplicationsClient />
}
