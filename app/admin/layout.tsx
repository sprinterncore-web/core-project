import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: adminCheck } = await supabase
    .from('admins')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  if (!adminCheck) redirect('/dashboard')

  return <div className="flex min-h-screen bg-canvas">{children}</div>
}
