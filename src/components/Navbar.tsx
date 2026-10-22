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

type NavbarProps = {
  onGetStarted?: () => void
}

export default function Navbar({ onGetStarted }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  function handleGetStarted() {
    if (onGetStarted) {
      onGetStarted()
    } else {
      window.location.href = '/#get-started'
    }
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-0">
          <span className="mr-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
            <Zap size={20} className="text-white" />
          </span>
          <span className="text-xl font-bold text-navy">sprint</span>
          <span className="text-xl font-bold text-teal">ern</span>
        </Link>

        <div className="hidden items-center md:flex">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate hover:text-navy"
            >
              Log in
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
                    </div>
                  </Link>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={handleGetStarted}
            className="ml-3 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark"
          >
            Get started
          </button>
        </div>

        <button
          type="button"
          className="text-navy md:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <Menu size={24} />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-b border-line bg-white px-6 py-6 shadow-lg md:hidden"
          >
            <div className="flex flex-col gap-4">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                Student Login
              </Link>
              <Link href="/company/login" onClick={() => setMobileOpen(false)}>
                Company Login
              </Link>
              <button
                type="button"
                onClick={handleGetStarted}
                className="rounded-full bg-teal py-3 text-sm font-semibold text-white"
              >
                Get started
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
