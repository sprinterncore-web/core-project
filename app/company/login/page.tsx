'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { CompanyAuthLeftPanel } from '@/components/company/CompanyAuthLeftPanel'
import { createClient } from '@/lib/supabase/client'
import { isTestingMode } from '@/lib/testing'
import { TestingBanner } from '@/components/ui/TestingBanner'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export default function CompanyLoginPage() {
  const router = useRouter()
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

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/company/callback`,
      },
    })
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email, password }
    )

    if (signInError) {
      setError('Invalid credentials.')
      setLoading(false)
      return
    }

    if (!testingMode && !data.user?.email_confirmed_at) {
      await supabase.auth.signOut()
      setError('Please confirm your email before logging in.')
      setLoading(false)
      return
    }

    if (!testingMode) {
      const { data: companyUser } = await supabase
        .from('company_users')
        .select('id, company_id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!companyUser) {
        await supabase.auth.signOut()
        setError('No company account found. Are you a student?')
        setLoading(false)
        return
      }
    }

    router.refresh()
    router.push('/company/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-canvas">
      <CompanyAuthLeftPanel />
      <div className="lg:ml-[50%]">
        <div className="mx-auto max-w-sm px-6 py-16">
          {showTesting ? (
            <TestingBanner enabled={testingMode} onChange={setTestingMode} />
          ) : null}
          <h1 className="text-2xl font-bold text-navy">Welcome back</h1>
          <p className="mt-2 text-sm text-slate">
            Don&apos;t have an account?{' '}
            <Link href="/company/signup" className="font-semibold text-blue">
              Sign up free
            </Link>
          </p>

          {testingMode ? (
            <p className="mt-2 text-center text-xs text-amber-600">
              Testing: email confirmation skipped
            </p>
          ) : null}

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
            <input
              required
              type="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            />
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue hover:underline"
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
              className="flex w-full items-center justify-center gap-2 rounded-full bg-blue py-3.5 font-bold text-white hover:bg-blue/90 disabled:opacity-70"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : null}
              Log In →
            </motion.button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-slate">or continue with</span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <button
            type="button"
            onClick={handleGoogle}
            className="mt-3 flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white py-3 text-sm font-semibold text-navy hover:shadow-md"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-slate/50">
            Are you a student?{' '}
            <Link href="/auth/login" className="text-teal hover:underline">
              Student login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
