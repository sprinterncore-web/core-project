'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'
import { createClient } from '@/lib/supabase/client'

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

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: `${firstName} ${lastName}`,
          university,
          major,
          graduation_year: parseInt(gradYear, 10),
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      setSuccess(true)
      setLoading(false)
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AuthLeftPanel />

      <div className="lg:ml-[50%]">
        <div className="mx-auto max-w-sm px-6 py-16">
          <h1 className="text-2xl font-bold text-navy">Create your account</h1>
          <p className="mt-2 text-sm text-slate">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-teal hover:underline"
            >
              Log in
            </Link>
          </p>

          {success ? (
            <div className="mt-12 text-center">
              <MailCheck size={48} className="mx-auto text-teal" />
              <h2 className="mt-4 text-xl font-bold text-navy">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-slate">
                We sent a confirmation link to {email}. Click it to activate
                your account.
              </p>
              <p className="mt-3 text-sm text-slate">
                Once you confirm your email, you&apos;ll be taken through a
                quick 4-step profile setup.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSignup}
              className="mt-8 flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
                <input
                  required
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
              </div>

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
                  minLength={8}
                  placeholder="Password (min 8 characters)"
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

              <input
                required
                placeholder="e.g. UC Berkeley"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />

              <input
                required
                placeholder="e.g. Computer Science"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />

              <select
                required
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              >
                <option value="" disabled>
                  Graduation year
                </option>
                {['2025', '2026', '2027', '2028', '2029'].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <div className="mt-2 flex items-start gap-2">
                <input required type="checkbox" id="terms" className="mt-1" />
                <label htmlFor="terms" className="text-sm text-slate">
                  I agree to the{' '}
                  <Link href="/terms" className="text-teal">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-teal">
                    Privacy Policy
                  </Link>
                </label>
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
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : null}
                Create Account
              </motion.button>
            </form>
          )}

          {!success ? (
            <>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-xs text-slate">or continue with</span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                className="mt-3 flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white py-3 text-sm font-semibold text-navy transition-all hover:shadow-md"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
