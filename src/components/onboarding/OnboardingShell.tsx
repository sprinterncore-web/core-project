'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { StepIndicator } from './StepIndicator'
import { createClient } from '@/lib/supabase/client'

function initialsFrom(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

type OnboardingShellProps = {
  currentStep: number
  title: string
  subtitle: string
  showStageBadge?: boolean
  children: React.ReactNode
}

export function OnboardingShell({
  currentStep,
  title,
  subtitle,
  showStageBadge = false,
  children,
}: OnboardingShellProps) {
  const router = useRouter()
  const [initials, setInitials] = useState('??')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const meta = user.user_metadata?.full_name as string | undefined
        setInitials(initialsFrom(meta ?? null, user.email ?? 'U'))
      }
    })
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
        <Link href="/" className="flex items-baseline gap-0">
          <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
            <Zap size={18} className="text-white" />
          </span>
          <span className="text-lg font-bold text-navy">sprint</span>
          <span className="text-lg font-bold text-teal">ern</span>
        </Link>

        <div className="hidden max-w-md flex-1 px-8 md:block">
          <StepIndicator currentStep={currentStep} />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-sm text-slate hover:text-navy"
          >
            Save & Exit
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
            {initials}
          </div>
        </div>
      </header>

      <div className="px-6 py-4 md:hidden">
        <StepIndicator currentStep={currentStep} />
      </div>

      <main className="flex flex-1 items-start justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-2xl">
          {showStageBadge ? (
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal-wash px-4 py-1.5 text-xs font-semibold text-teal">
              ⚡ STAGE {currentStep} COMPLETED • INSTANT CALIBRATION ACTIVE
            </span>
          ) : null}

          {title ? (
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className="mt-2 max-w-lg text-base leading-relaxed text-slate">
              {subtitle}
            </p>
          ) : null}

          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  )
}

export const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy transition-all duration-150 placeholder:text-slate/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10'

export const labelClass = 'mb-1.5 block text-sm font-semibold text-navy'
