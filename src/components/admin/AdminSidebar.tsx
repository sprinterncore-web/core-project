'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Briefcase,
  Building2,
  Globe,
  LogOut,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const manageLinks = [
  { href: '/admin/students', icon: Users, label: 'Students' },
  { href: '/admin/companies', icon: Building2, label: 'Companies' },
  { href: '/admin/jobs', icon: Briefcase, label: 'Job Listings' },
]

const toolLinks = [
  { href: '/admin/matches', icon: Sparkles, label: 'Match Results' },
  { href: '/', icon: Globe, label: 'View Live Site', external: true },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [initials, setInitials] = useState('SA')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email)
        setInitials(user.email.slice(0, 2).toUpperCase())
      }
    })
  }, [])

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  function navItem(href: string, icon: typeof Users, label: string) {
    const active =
      pathname === href || (href !== '/admin' && pathname.startsWith(href))
    const Icon = icon
    return (
      <Link
        key={href}
        href={href}
        className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
          active
            ? 'bg-white/12 text-white'
            : 'text-white/60 hover:bg-white/8 hover:text-white'
        }`}
      >
        {active ? (
          <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-teal" />
        ) : null}
        <Icon size={18} />
        {label}
      </Link>
    )
  }

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-navy">
      <div className="p-6">
        <Link href="/admin" className="flex items-baseline gap-0">
          <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
            <Zap size={18} className="text-white" />
          </span>
          <span className="text-lg font-bold text-white">sprint</span>
          <span className="text-lg font-bold text-teal">ern</span>
        </Link>
        <span className="mt-2 inline-block rounded-full border border-teal/30 bg-teal/20 px-3 py-1 text-xs font-semibold text-teal">
          Master Panel
        </span>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
          MANAGE
        </p>
        {manageLinks.map((l) => navItem(l.href, l.icon, l.label))}

        <div className="mb-4 mt-6 border-t border-white/10" />
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
          TOOLS
        </p>
        {toolLinks.map((l) =>
          l.external ? (
            <Link
              key={l.href}
              href={l.href}
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/8 hover:text-white"
            >
              <l.icon size={18} />
              {l.label}
            </Link>
          ) : (
            navItem(l.href, l.icon, l.label)
          )
        )}
      </nav>

      <div className="mt-auto p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/8 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-sm font-bold text-navy">
            {initials}
          </div>
          <span className="truncate text-xs text-white/60">{email}</span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-3 flex w-full items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-white/70"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </aside>
  )
}
