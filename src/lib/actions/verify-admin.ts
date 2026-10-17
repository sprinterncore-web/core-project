'use server'

import { createClient } from '@/lib/supabase/server'
import { isAdminUserId } from '@/lib/supabase/service'

export async function verifyCurrentUserIsAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  return isAdminUserId(user.id)
}
