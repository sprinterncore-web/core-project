'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  companyName: string
  userName: string
}

const links = [
  { href: '/company/dashboard', label: 'Dashboard' },
  { href: '/company/jobs', label: 'Job Listings' },
  { href: '/book', label: 'Book a Call' },
]

export function CompanyPortalNav({ companyName, userName }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = userName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/company/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-line bg-white">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        <div className="flex items-center">
          <Link href="/company/dashboard" className="flex items-baseline">
            <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue to-teal">
              <Zap size={16} className="text-white" />
            </span>
            <span className="text-lg font-bold text-navy">sprint</span>
            <span className="text-lg font-bold text-teal">ern</span>
          </Link>
          <span className="mx-3 text-line">|</span>
          <span className="text-sm font-semibold text-navy">{companyName}</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active =
              link.href === '/company/dashboard'
                ? pathname === link.href
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  active
                    ? 'font-semibold text-navy'
                    : 'text-slate hover:text-navy'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue text-xs font-bold text-white"
            aria-label="Account menu"
          >
            {initials || 'CO'}
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-line bg-white py-2 shadow-lg">
              <button
                type="button"
                disabled
                className="block w-full px-4 py-2 text-left text-sm text-slate/50"
              >
                Account
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-navy hover:bg-canvas"
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
