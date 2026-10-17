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
  if (!user.email_confirmed_at) {
    redirect('/company/login?error=email_not_confirmed')
  }

  const { data: companyUser } = await supabase
    .from('company_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!companyUser) redirect('/company/login')

  return <div className="min-h-screen bg-canvas">{children}</div>
}
