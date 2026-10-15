'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      }
    )

    if (signInError) {
      setError('Invalid credentials. Access denied.')
      setLoading(false)
      return
    }

    if (!data.user) {
      setLoading(false)
      return
    }

    const { data: adminRow } = await supabase
      .from('admins')
      .select('id, role')
      .eq('id', data.user.id)
      .single()

    if (!adminRow) {
      await supabase.auth.signOut()
      setError(
        'Access denied. This account is not authorised for the master panel.'
      )
      setLoading(false)
      return
    }

    router.refresh()
    router.push('/admin/students')
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

        <h1 className="mt-6 text-center text-2xl font-bold text-navy">
          Admin Login
        </h1>
        <p className="mt-1 text-center text-sm text-slate">
          Restricted access. Authorised team only.
        </p>

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Email
            </label>
            <input
              required
              type="email"
              placeholder="sprinterncore@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-navy placeholder:text-slate/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas px-4 py-3 pr-12 text-sm text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10"
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
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-teal py-3.5 font-bold text-white transition-all hover:bg-teal-dark disabled:opacity-70"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : null}
            Log In →
          </motion.button>
        </form>

        <div className="mt-8 border-t border-line pt-4">
          <p className="text-center text-xs text-slate">
            Not an admin?{' '}
            <Link href="/auth/login" className="text-teal hover:underline">
              Student login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
