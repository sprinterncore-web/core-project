import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { enforceStudentPortalAccess } from '@/lib/supabase/portal-gate.server'
import DashboardHomeClient from './DashboardHomeClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  await enforceStudentPortalAccess(user.id)

  return <DashboardHomeClient />
}
