import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: adminCheck } = await supabase
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!adminCheck) redirect('/admin/login')

  return <div className="flex min-h-screen bg-canvas">{children}</div>
}
