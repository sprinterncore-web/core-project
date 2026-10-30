import { createClient } from '@/lib/supabase/client'
import { getClientSiteUrl } from '@/lib/site-url'

export async function signInWithGoogleStudent(): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getClientSiteUrl()}/auth/callback`,
    },
  })
  if (error) throw error
}
