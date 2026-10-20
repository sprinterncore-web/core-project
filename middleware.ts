import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminUserId } from '@/lib/supabase/service'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isPublicAdminRoute =
    pathname === '/admin/login' || pathname === '/admin/signup'

  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (!user && pathname.startsWith('/onboarding')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (!isPublicAdminRoute && pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (!(await isAdminUserId(user.id))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  const isCompanyPortalRoute =
    pathname.startsWith('/company/dashboard') ||
    pathname.startsWith('/company/jobs')

  if (isCompanyPortalRoute && !user) {
    return NextResponse.redirect(new URL('/company/login', request.url))
  }

  if (
    user &&
    (pathname.startsWith('/auth/login') ||
      pathname.startsWith('/auth/signup'))
  ) {
    const url = request.nextUrl.clone()
    if (await isAdminUserId(user.id)) {
      url.pathname = '/admin/students'
      return NextResponse.redirect(url)
    }

    const { data: companyUser } = await supabase
      .from('company_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (companyUser) {
      url.pathname = '/company/dashboard'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete, onboarding_step')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.onboarding_complete) {
      const step = profile?.onboarding_step ?? 0
      url.pathname = `/onboarding/step/${Math.max(1, step + 1)}`
    } else {
      url.pathname = '/dashboard'
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
