'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { signInWithGoogleStudent } from '@/lib/supabase/google-auth-student'

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

type Props = {
  className?: string
}

export function GoogleAuthButton({ className = 'mt-3' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogleStudent()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed')
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      {error ? (
        <p className="mb-2 text-center text-xs text-red-600">{error}</p>
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white py-3 text-sm font-semibold text-navy transition-all hover:shadow-md disabled:opacity-70"
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin text-slate" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>
    </div>
  )
}

export function GoogleAuthDivider({ className = 'mt-6' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-px flex-1 bg-line" />
      <span className="text-xs text-slate">or continue with</span>
      <div className="h-px flex-1 bg-line" />
    </div>
  )
}
