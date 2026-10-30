import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  console.log('[MIDDLEWARE] hit:', pathname)

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: req.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: req.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('[MIDDLEWARE] user:', user?.id ?? 'none', 'path:', pathname)

  if (!user) {
    if (pathname === '/admin/login' || pathname === '/admin/signup') {
      return response
    }
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      console.log('[MIDDLEWARE] no user, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    return response
  }

  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isProfileRoute = pathname.startsWith('/dashboard/profile')

  if (isDashboardRoute && !isProfileRoute) {
    console.log('[MIDDLEWARE] checking portal access for:', user.id)

    const { data: companyUser } = await supabase
      .from('company_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (companyUser) {
      console.log('[MIDDLEWARE] company user, allowing through')
      return response
    }

    const { data: adminRow } = await supabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (adminRow) {
      console.log('[MIDDLEWARE] admin user, allowing through')
      return response
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('portal_access')
      .eq('id', user.id)
      .maybeSingle()

    console.log(
      '[MIDDLEWARE] profile:',
      JSON.stringify(profile),
      'error:',
      error?.message
    )

    if (profile?.portal_access !== true) {
      console.log(
        '[MIDDLEWARE] BLOCKING - portal_access is:',
        profile?.portal_access,
        '- redirecting to profile'
      )
      const redirectUrl = new URL('/dashboard/profile', req.url)
      redirectUrl.searchParams.set('waitlisted', 'true')
      return NextResponse.redirect(redirectUrl)
    }

    console.log('[MIDDLEWARE] portal_access is true, allowing through')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
