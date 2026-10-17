import { createClient } from '@/lib/supabase/server'
import { isAdminUserId } from '@/lib/supabase/service'
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

  if (!(await isAdminUserId(user.id))) redirect('/admin/login')

  return <div className="flex min-h-screen bg-canvas">{children}</div>
}
