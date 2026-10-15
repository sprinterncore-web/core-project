import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const supabaseClient = await createClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      if (user) {
        const { data: adminCheck } = await supabaseClient
          .from('admins')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (adminCheck) {
          return NextResponse.redirect(`${origin}/admin`)
        }

        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('onboarding_complete, onboarding_step')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile?.onboarding_complete) {
          const step = profile?.onboarding_step ?? 0
          return NextResponse.redirect(
            `${origin}/onboarding/step/${Math.max(1, step + 1)}`
          )
        }

        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
