import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isAdminUserId } from '@/lib/supabase/service'
import { isLocalDevHostname } from '@/lib/testing'

function isEduEmail(email: string): boolean {
  return email.toLowerCase().endsWith('.edu')
}

async function resolveStudentRedirect(
  supabase: SupabaseClient,
  user: User,
  hostname: string
): Promise<string> {
  const email = user.email ?? ''
  const skipEduCheck =
    process.env.NODE_ENV === 'development' && isLocalDevHostname(hostname)

  if (!skipEduCheck && email && !isEduEmail(email)) {
    await supabase.auth.signOut()
    return '/auth/login?error=not_edu'
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, onboarding_complete, onboarding_step, portal_access')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email ?? '',
      full_name: fullName,
      portal_access: false,
      waitlist_submitted_at: new Date().toISOString(),
    })

    if (insertError) {
      return '/auth/login?error=auth_callback_failed'
    }

    return '/dashboard/profile?waitlisted=true'
  }

  if (profile.portal_access !== true) {
    return '/dashboard/profile?waitlisted=true'
  }

  if (profile.onboarding_complete) {
    return '/dashboard'
  }

  const step = profile.onboarding_step ?? 0
  return `/onboarding/step/${Math.max(1, step + 1)}`
}

export async function GET(request: Request) {
  const { searchParams, origin, hostname } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')

  if (oauthError) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
  }

  const cookieStore = await cookies()
  const pendingCookies: {
    name: string
    value: string
    options: CookieOptions
  }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet)
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  let redirectPath = '/auth/login?error=auth_callback_failed'

  if (!error && data.user) {
    const user = data.user

    if (await isAdminUserId(user.id)) {
      redirectPath = '/admin/students'
    } else {
      const { data: companyUser } = await supabase
        .from('company_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (companyUser) {
        redirectPath = '/company/dashboard'
      } else {
        redirectPath = await resolveStudentRedirect(supabase, user, hostname)
      }
    }
  }

  const response = NextResponse.redirect(`${origin}${redirectPath}`)
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
