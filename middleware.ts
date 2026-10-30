import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isStudentWaitlisted } from '@/lib/portal-access'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return res
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // --- Not logged in: protect all dashboard/admin routes ---
  if (!session) {
    if (pathname === '/admin/login' || pathname === '/admin/signup') {
      return res
    }
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    return res
  }

  // --- Logged in: check portal_access for student dashboard routes ---
  // Only gate /dashboard routes that are NOT /dashboard/profile
  const isProtectedDashboard =
    pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/dashboard/profile')

  if (isProtectedDashboard) {
    // Check if this is a company user (bypass gate)
    const { data: companyUser } = await supabase
      .from('company_users')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle()

    if (companyUser) {
      // Company user — full access
      return res
    }

    const { data: adminRow } = await supabase
      .from('admins')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle()

    if (adminRow) {
      return res
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('portal_access')
      .eq('id', session.user.id)
      .maybeSingle()

    // Student without explicit portal_access — redirect to profile
    if (isStudentWaitlisted(profile)) {
      console.log(
        '[Middleware] Blocking student - portal_access:',
        profile?.portal_access,
        'user:',
        session.user.id
      )
      const url = new URL('/dashboard/profile', req.url)
      url.searchParams.set('waitlisted', 'true')
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
}
