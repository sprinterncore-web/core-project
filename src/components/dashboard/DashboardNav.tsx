'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bell, ClipboardList, HelpCircle, UserCircle, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { countPendingApplications } from '@/lib/supabase/applications'
import { getProfile } from '@/lib/supabase/profile'
import {
  calculateProfileCompletion,
  normalizeProfile,
} from '@/lib/profileCompletion'

type DashboardNavProps = {
  userEmail: string
  userName: string | null
}

function initials(userName: string | null, email: string): string {
  if (userName) {
    const parts = userName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  return email.charAt(0).toUpperCase()
}

export function DashboardNav({ userEmail, userName }: DashboardNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState(0)
  const [completionPct, setCompletionPct] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      countPendingApplications(user.id).then(setPendingCount)
      const p = await getProfile(user.id)
      if (p) setCompletionPct(calculateProfileCompletion(normalizeProfile(p)))
    })
  }, [pathname])

  const avatarInitials = initials(userName, userEmail)
  const ringCirc = 2 * Math.PI * 20
  const ringOffset = ringCirc * (1 - completionPct / 100)

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-line bg-white">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-0">
          <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
            <Zap size={18} className="text-white" />
          </span>
          <span className="text-lg font-bold text-navy">sprint</span>
          <span className="text-lg font-bold text-teal">ern</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/dashboard"
            className={`text-sm font-medium ${
              pathname === '/dashboard'
                ? 'text-navy'
                : 'text-slate hover:text-navy'
            }`}
          >
            Matches
          </Link>
          <Link
            href="/dashboard/profile"
            className={`inline-flex items-center gap-1.5 text-sm font-medium ${
              pathname.startsWith('/dashboard/profile')
                ? 'text-navy'
                : 'text-slate hover:text-navy'
            }`}
          >
            <UserCircle size={16} />
            Profile
          </Link>
          <Link
            href="/dashboard/applications"
            className={`relative inline-flex items-center gap-1.5 text-sm font-medium ${
              pathname.startsWith('/dashboard/applications')
                ? 'text-navy'
                : 'text-slate hover:text-navy'
            }`}
          >
            <ClipboardList size={16} />
            My Applications
            {pendingCount > 0 ? (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue px-1.5 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            ) : null}
          </Link>
        </nav>

        <div className="hidden md:flex">
          <span className="rounded-full border border-teal/20 bg-teal-wash px-4 py-1.5 text-xs font-semibold text-teal">
            ● STUDENT × STARTUP MATCH
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hidden items-center gap-1.5 text-sm text-slate hover:text-navy sm:flex"
          >
            <HelpCircle size={16} />
            Help
          </button>
          <button type="button" className="relative text-slate">
            <Bell size={20} />
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="hidden rounded-full border border-line px-4 py-2 text-sm font-medium text-navy transition-all hover:border-navy sm:block"
          >
            Save & Exit
          </button>
          <Link
            href="/dashboard/profile"
            className="relative flex h-9 w-9 items-center justify-center"
            aria-label="Your profile"
          >
            <svg
              className="absolute inset-0 h-9 w-9 -rotate-90"
              viewBox="0 0 44 44"
            >
              <circle
                cx="22"
                cy="22"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-line"
              />
              <circle
                cx="22"
                cy="22"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-teal"
                strokeDasharray={ringCirc}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
              {avatarInitials}
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
