'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, Loader2, Zap } from 'lucide-react'
import { Toast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { getProfile } from '@/lib/supabase/profile'
import type { Profile } from '@/types/database'

export default function WaitlistPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ visible: false, message: '' })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }
      const p = await getProfile(user.id)
      if (p?.portal_access) {
        router.replace('/dashboard')
        return
      }
      router.replace('/dashboard/profile?waitlisted=true')
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 className="animate-spin text-teal" size={32} />
      </div>
    )
  }

  const skillsCount = profile?.skills?.length ?? 0

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-12 text-center shadow-sm">
        <Link href="/" className="inline-flex items-baseline gap-0">
          <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
            <Zap size={18} className="text-white" />
          </span>
          <span className="text-lg font-bold text-navy">sprint</span>
          <span className="text-lg font-bold text-teal">ern</span>
        </Link>

        <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-wash">
          <Clock size={40} className="text-teal" />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-navy">
          You&apos;re on the waitlist
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate">
          Your profile has been received. We&apos;re working through applications
          and will email you when your sprint dashboard is ready.
        </p>

        <div className="mt-8 border-t border-line pt-6 text-left">
          <p className="mb-4 text-sm font-semibold text-navy">Your profile</p>
          {[
            ['Name', profile?.full_name ?? '—'],
            ['University', profile?.university ?? '—'],
            ['Skills', `${skillsCount} selected`],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="flex justify-between border-b border-line py-2 last:border-0"
            >
              <span className="text-sm text-slate">{label}</span>
              <span className="text-sm font-semibold text-navy">{value}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mt-6 text-sm font-semibold text-teal hover:underline"
          onClick={() =>
            setToast({
              visible: true,
              message: 'Profile editing opens when your portal activates.',
            })
          }
        >
          Edit your profile
        </button>

        <p className="mt-8 text-xs text-slate/50">
          Questions?{' '}
          <a href="mailto:hello@sprintern.ai" className="hover:text-slate">
            hello@sprintern.ai
          </a>
        </p>
      </div>

      <Toast
        message={toast.message}
        type="warning"
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  )
}
