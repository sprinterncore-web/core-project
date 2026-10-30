'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { verifyCurrentUserIsAdmin } from '@/lib/actions/verify-admin'
import { isTestingMode } from '@/lib/testing'

function isEduEmail(email: string): boolean {
  return email.toLowerCase().endsWith('.edu')
}

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      setErrorMessage(
        errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          : 'Verification failed'
      )
      return
    }

    if (!code) {
      router.replace('/auth/login')
      return
    }

    async function run() {
      const supabase = createClient()
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code!)

      if (exchangeError) {
        setErrorMessage(exchangeError.message)
        return
      }

      if (await verifyCurrentUserIsAdmin()) {
        router.replace('/admin/students')
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login?error=auth_callback_failed')
        return
      }

      const { data: companyUser } = await supabase
        .from('company_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (companyUser) {
        router.replace('/company/dashboard')
        return
      }

      const email = user.email ?? ''
      if (!isTestingMode() && email && !isEduEmail(email)) {
        await supabase.auth.signOut()
        router.replace('/auth/login?error=not_edu')
        return
      }

      let { data: profile } = await supabase
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
          setErrorMessage(insertError.message)
          return
        }

        router.replace('/dashboard/profile?waitlisted=true')
        return
      }

      if (profile.portal_access !== true) {
        router.replace('/dashboard/profile?waitlisted=true')
        return
      }

      if (profile.onboarding_complete) {
        router.replace('/dashboard')
        return
      }

      const step = profile.onboarding_step ?? 0
      router.replace(`/onboarding/step/${Math.max(1, step + 1)}`)
    }

    run()
  }, [searchParams, router])

  if (errorMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
        <XCircle size={48} className="text-red-500" />
        <h1 className="mt-4 text-xl font-bold text-navy">Verification failed</h1>
        <p className="mt-2 max-w-md text-sm text-slate">{errorMessage}</p>
        <Link
          href="/auth/signup"
          className="mt-6 rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white"
        >
          Try signing up again →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <Loader2 size={48} className="animate-spin text-teal" />
      <p className="mt-4 text-lg font-semibold text-navy">Signing you in...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={48} className="animate-spin text-teal" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
