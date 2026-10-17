'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Briefcase,
  Building2,
  ChevronDown,
  GraduationCap,
  Menu,
  UserPlus,
  Zap,
} from 'lucide-react'
import { useScrollY } from '../hooks/useScrollY'

const MotionLink = motion(Link)

const navLinks = [
  { label: 'For Companies', href: '/#toggle-section' },
  { label: 'For Students', href: '/auth/signup' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'About', href: '/#about' },
]

export default function Navbar() {
  const scrollY = useScrollY()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const scrolled = scrollY >= 80

  const barClass = scrolled
    ? 'bg-white/95 backdrop-blur-md border-b border-line shadow-[0_1px_12px_rgba(10,22,40,0.06)]'
    : 'bg-canvas/80 backdrop-blur-md'

  const closeMobile = () => setMobileOpen(false)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  return (
    <header className="sticky top-0 z-50">
      <nav className={`h-[72px] transition-all duration-300 ${barClass}`}>
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
          <Link href="/" className="flex items-baseline gap-0">
            <span className="mr-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
              <Zap size={20} className="text-white" />
            </span>
            <span className="text-xl font-bold text-navy">sprint</span>
            <span className="text-xl font-bold text-teal">ern</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate transition-colors duration-150 hover:text-navy"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="inline-flex items-center gap-1 text-sm font-medium text-slate hover:text-navy"
              >
                Sign In / Sign Up
                <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {dropdownOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-lg"
                  >
                    <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate/50">
                      Students
                    </p>
                    <Link
                      href="/auth/login"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-canvas"
                    >
                      <GraduationCap size={16} className="text-teal" />
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          Student Login
                        </p>
                        <p className="text-xs text-slate/60">
                          Access your matches
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-canvas"
                    >
                      <UserPlus size={16} className="text-teal" />
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          Student Sign Up
                        </p>
                        <p className="text-xs text-slate/60">
                          Join as a student
                        </p>
                      </div>
                    </Link>
                    <div className="my-2 border-t border-line" />
                    <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate/50">
                      Companies
                    </p>
                    <Link
                      href="/company/login"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-canvas"
                    >
                      <Building2 size={16} className="text-blue" />
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          Company Login
                        </p>
                        <p className="text-xs text-slate/60">
                          Access your portal
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/company/signup"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-canvas"
                    >
                      <Briefcase size={16} className="text-blue" />
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          Company Sign Up
                        </p>
                        <p className="text-xs text-slate/60">Partner with us</p>
                      </div>
                    </Link>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <MotionLink
              href="/book"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,201,167,0.3)] transition-all duration-200 hover:bg-teal-dark"
            >
              Book a Call
            </MotionLink>
          </div>

          <button
            type="button"
            className="text-navy md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="border-b border-line bg-white px-6 py-6 shadow-lg md:hidden"
          >
            <div className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMobile}
                  className="text-base font-medium text-navy"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/auth/login" onClick={closeMobile} className="text-base">
                Student Login
              </Link>
              <Link href="/auth/signup" onClick={closeMobile} className="text-base">
                Student Sign Up
              </Link>
              <Link href="/company/login" onClick={closeMobile} className="text-base">
                Company Login
              </Link>
              <Link href="/company/signup" onClick={closeMobile} className="text-base">
                Company Sign Up
              </Link>
              <MotionLink
                href="/book"
                onClick={closeMobile}
                whileTap={{ scale: 0.97 }}
                className="mt-2 w-full rounded-full bg-teal py-3 text-center text-sm font-semibold text-white"
              >
                Book a Call
              </MotionLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
