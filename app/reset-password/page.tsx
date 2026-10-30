'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined
    let timeoutId: number | undefined

    async function establishSession() {
      const supabase = createClient()
      const code = searchParams.get('code')

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          if (!cancelled) setSessionError(exchangeError.message)
          return
        }
        if (!cancelled) setReady(true)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        if (!cancelled) setReady(true)
        return
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, nextSession) => {
        if (
          event === 'PASSWORD_RECOVERY' ||
          event === 'SIGNED_IN' ||
          nextSession
        ) {
          if (!cancelled) setReady(true)
        }
      })
      unsubscribe = () => subscription.unsubscribe()

      timeoutId = window.setTimeout(async () => {
        const {
          data: { session: retrySession },
        } = await supabase.auth.getSession()
        if (!cancelled) {
          if (retrySession) setReady(true)
          else
            setSessionError(
              'This reset link is invalid or expired. Request a new one from the login page.'
            )
        }
      }, 2500)
    }

    void establishSession()

    return () => {
      cancelled = true
      unsubscribe?.()
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [searchParams])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setDone(true)
    window.setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  if (sessionError) {
    return (
      <>
        <h1 className="text-2xl font-bold text-navy">Link expired</h1>
        <p className="mt-3 text-sm text-slate">{sessionError}</p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-sm font-semibold text-teal hover:underline"
        >
          Request a new reset link →
        </Link>
      </>
    )
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <Loader2 size={40} className="animate-spin text-teal" />
        <p className="mt-4 text-sm text-slate">Verifying your reset link…</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 size={48} className="mx-auto text-teal" />
        <h1 className="mt-4 text-2xl font-bold text-navy">Password updated</h1>
        <p className="mt-2 text-sm text-slate">Redirecting to your dashboard…</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Set a new password</h1>
      <p className="mt-2 text-sm text-slate">Choose a strong password (8+ characters).</p>

      <form onSubmit={handleUpdate} className="mt-8 flex flex-col gap-4">
        <div className="relative">
          <input
            required
            type={showPassword ? 'text' : 'password'}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            className={`${inputClass} pr-12`}
            autoComplete="new-password"
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

        <input
          required
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          className={inputClass}
          autoComplete="new-password"
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
          Update password
        </motion.button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <AuthLeftPanel />

      <div className="lg:ml-[50%]">
        <div className="mx-auto max-w-sm px-6 py-16">
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Loader2 size={40} className="animate-spin text-teal" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
