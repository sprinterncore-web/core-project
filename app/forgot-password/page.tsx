'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'
import { createClient } from '@/lib/supabase/client'
import { getClientSiteUrl } from '@/lib/site-url'
import { isDevTestingActive, isTestingMode } from '@/lib/testing'
import { TestingBanner } from '@/components/ui/TestingBanner'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testingMode, setTestingMode] = useState(false)
  const [showTesting] = useState(() => isTestingMode())

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (
      !isDevTestingActive(testingMode) &&
      !email.toLowerCase().endsWith('.edu')
    ) {
      setError('Enter the .edu email you used for email/password sign-up.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${getClientSiteUrl()}/reset-password`,
      }
    )

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSent(true)
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AuthLeftPanel />

      <div className="lg:ml-[50%]">
        <div className="mx-auto max-w-sm px-6 py-16">
          {process.env.NODE_ENV === 'development' && showTesting ? (
            <TestingBanner enabled={testingMode} onChange={setTestingMode} />
          ) : null}

          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal/10 text-teal">
                <MailCheck size={28} />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-navy">Check your email</h1>
              <p className="mt-3 text-sm text-slate">
                If an account exists for{' '}
                <strong className="text-navy">{email}</strong>, we sent a link
                to reset your password. The link expires after a short time.
              </p>
              <p className="mt-4 text-xs text-slate/70">
                Signed up with Google? Use{' '}
                <strong>Continue with Google</strong> on the login page — those
                accounts don&apos;t use a password.
              </p>
              <Link
                href="/auth/login"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-teal hover:underline"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-navy">Reset your password</h1>
              <p className="mt-2 text-sm text-slate">
                Enter your university email and we&apos;ll send a reset link.
              </p>
              <p className="mt-3 rounded-xl border border-line bg-white/80 px-3 py-2 text-xs text-slate">
                Email/password accounts only. If you use Google sign-in, go back
                and choose <strong>Continue with Google</strong>.
              </p>

              <form onSubmit={handleReset} className="mt-8 flex flex-col gap-4">
                <input
                  required
                  type="email"
                  placeholder="Your .edu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  autoComplete="email"
                />

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
                  Send reset link
                </motion.button>
              </form>

              <Link
                href="/auth/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal hover:underline"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
