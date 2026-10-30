'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, MailWarning } from 'lucide-react'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'
import { createClient } from '@/lib/supabase/client'
import { verifyCurrentUserIsAdmin } from '@/lib/actions/verify-admin'
import { isDevTestingActive, isTestingMode } from '@/lib/testing'
import { TestingBanner } from '@/components/ui/TestingBanner'
import {
  GoogleAuthButton,
  GoogleAuthDivider,
} from '@/components/auth/GoogleAuthButton'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testingMode, setTestingMode] = useState(false)
  const [showTesting, setShowTesting] = useState(false)

  useEffect(() => {
    setShowTesting(isTestingMode())
  }, [])

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'auth_callback_failed') {
      setError('Authentication failed. Please try again.')
    } else if (err === 'not_edu') {
      setError('Please sign in with your university .edu Google account.')
    } else if (err === 'oauth') {
      setError('Google sign-in failed. Please try again.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      if (!isDevTestingActive(testingMode) && !data.user.email_confirmed_at) {
        await supabase.auth.signOut()
        setError(
          'Please confirm your email before logging in. Check your inbox for the verification link.'
        )
        setLoading(false)
        return
      }

      if (await verifyCurrentUserIsAdmin()) {
        router.refresh()
        router.push('/admin')
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete, onboarding_step, portal_access')
          .eq('id', data.user.id)
          .single()

        if (
          profile &&
          profile.portal_access !== true &&
          !isDevTestingActive(testingMode)
        ) {
          router.push('/dashboard/profile?waitlisted=true')
        } else if (!profile?.onboarding_complete) {
          const step = profile?.onboarding_step ?? 0
          router.push(`/onboarding/step/${Math.max(1, step + 1)}`)
        } else {
          router.push('/dashboard')
        }
      }
    }

    setLoading(false)
  }

  return (
    <>
      {process.env.NODE_ENV === 'development' && showTesting ? (
        <TestingBanner enabled={testingMode} onChange={setTestingMode} />
      ) : null}
      <h1 className="text-2xl font-bold text-navy">Welcome back</h1>
      <p className="mt-2 text-sm text-slate">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/signup"
          className="font-semibold text-teal hover:underline"
        >
          Sign up free
        </Link>
      </p>

      {isDevTestingActive(testingMode) ? (
        <p className="mt-2 text-center text-xs text-amber-600">
          Testing: email confirmation skipped
        </p>
      ) : null}

      {errorParam === 'email_not_confirmed' ? (
        <div className="mb-4 mt-8 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <MailWarning size={16} className="flex-shrink-0" />
          <span>
            Please verify your email before logging in. Check your inbox for
            the confirmation link.
          </span>
        </div>
      ) : null}

      <form
        onSubmit={handleLogin}
        className={`flex flex-col gap-4 ${errorParam === 'email_not_confirmed' ? 'mt-0' : 'mt-8'}`}
      >
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />

        <div className="relative">
          <input
            required
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 pr-12 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-teal hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-teal py-3.5 font-semibold text-white transition-all hover:bg-teal-dark disabled:opacity-70"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : null}
          Log In
        </motion.button>
      </form>

      <GoogleAuthDivider />
      <GoogleAuthButton />
      <p className="mt-2 text-center text-xs text-slate/60">
        Use your university Google account (.edu email)
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <AuthLeftPanel />

      <div className="lg:ml-[50%]">
        <div className="mx-auto max-w-sm px-6 py-16">
          <Suspense fallback={<div className="text-slate">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
