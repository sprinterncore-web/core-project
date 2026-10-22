'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, MailCheck, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getClientSiteUrl } from '@/lib/site-url'

export default function AdminSignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${getClientSiteUrl()}/admin/login`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
              <Zap size={24} className="text-white" />
            </span>
            <span className="text-2xl font-bold text-navy">sprint</span>
            <span className="text-2xl font-bold text-teal">ern</span>
          </div>
          <span className="mt-3 inline-block rounded-full border border-teal/20 bg-teal-wash px-3 py-1 text-xs font-bold text-teal">
            Master Panel
          </span>
        </div>

        {success ? (
          <div className="mt-8 text-center">
            <MailCheck size={48} className="mx-auto text-teal" />
            <h2 className="mt-4 text-xl font-bold text-navy">Check your email</h2>
            <p className="mt-2 text-sm text-slate">
              Click the confirmation link, then ask the team to grant you admin
              access in Supabase.
            </p>
          </div>
        ) : (
          <>
            <h1 className="mt-6 text-center text-2xl font-bold text-navy">
              Create Admin Account
            </h1>
            <p className="mt-1 text-center text-sm text-slate">
              This link is for authorised Sprintern team members only.
            </p>

            <form
              onSubmit={handleSignup}
              className="mt-8 flex flex-col gap-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">
                  Full name
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">
                  Password
                </label>
                <div className="relative">
                  <input
                    required
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-line bg-canvas px-4 py-3 pr-12 text-sm text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    required
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-line bg-canvas px-4 py-3 pr-12 text-sm text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
                className="flex w-full items-center justify-center gap-2 rounded-full bg-teal py-3.5 font-bold text-white hover:bg-teal-dark disabled:opacity-70"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                Create Account →
              </motion.button>
            </form>
          </>
        )}

        <p className="mt-8 text-center text-xs text-slate">
          Already have access?{' '}
          <Link href="/admin/login" className="text-teal hover:underline">
            Log in →
          </Link>
        </p>
      </div>
    </div>
  )
}
