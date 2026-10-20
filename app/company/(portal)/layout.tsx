import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CompanyPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/company/login')

  // Company membership is validated on login and in page UI — do not redirect
  // here (missing company_users row + middleware login bounce caused loops).

  return <div className="min-h-screen bg-canvas">{children}</div>
}
