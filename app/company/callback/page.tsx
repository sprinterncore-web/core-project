'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function CompanyCallbackContent() {
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
      router.replace('/company/login')
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

      router.replace('/company/dashboard')
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
          href="/company/signup"
          className="mt-6 rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white"
        >
          Try signing up again →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <Loader2 size={48} className="animate-spin text-blue" />
      <p className="mt-4 text-lg font-semibold text-navy">
        Verifying your email...
      </p>
    </div>
  )
}

export default function CompanyCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={48} className="animate-spin text-blue" />
        </div>
      }
    >
      <CompanyCallbackContent />
    </Suspense>
  )
}
