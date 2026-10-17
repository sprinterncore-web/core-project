'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowDown, CalendarCheck, GraduationCap, Zap } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
}

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const, delay: 0.5 },
  },
}

export default function Hero() {
  const reducedMotion = useReducedMotion()
  const initialState = reducedMotion ? 'visible' : 'hidden'

  return (
    <section className="relative overflow-hidden bg-canvas px-6 pb-24 pt-32">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <svg width="100%" height="100%" aria-hidden>
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#CBD5E1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[320px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/[0.08] blur-3xl" />

      <motion.div
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
        variants={container}
        initial={initialState}
        animate="visible"
      >
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-teal/25 bg-teal-wash px-4 py-1.5"
        >
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-teal" />
          <span className="text-xs font-semibold uppercase tracking-widest text-teal">
            Student × Startup Match
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-7 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[64px]"
        >
          <span className="block text-navy">Match the right students</span>
          <span className="mt-1 block text-teal">to the right roles.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-[540px] text-lg leading-relaxed text-slate"
        >
          No forms. No friction. We handle company onboarding — you receive matched sprint talent.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 rounded-full bg-teal px-9 py-4 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,201,167,0.38)] transition-colors duration-200 hover:bg-teal-dark hover:shadow-[0_6px_28px_rgba(0,201,167,0.5)]"
          >
            <CalendarCheck size={16} />
            Book a Call
          </motion.a>
          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-8 py-4 text-sm font-semibold text-navy transition-all duration-200 hover:border-blue hover:text-blue"
          >
            <ArrowDown size={16} />
            See How It Works
          </motion.a>
          <motion.div whileHover={{ scale: 1.03 }}>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full bg-blue px-8 py-4 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(46,111,243,0.3)] transition-all hover:bg-blue/90"
            >
              <GraduationCap size={16} />
              Sign Up as Student →
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate/70"
        >
          <span>
            <span className="text-teal">✦</span> Sprint projects kick off in &lt; 5 days
          </span>
          <span className="text-line">·</span>
          <span>100% pre-screened universities</span>
        </motion.p>

        <motion.div
          variants={cardItem}
          className="mx-auto mt-14 flex w-full max-w-2xl flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-md sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-semibold text-navy">Sprint Cohort #47</span>
                <span className="rounded-full border border-teal/20 bg-teal-wash px-2 py-0.5 text-[11px] font-bold text-teal">
                  98% Match
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate">
                Full-Stack TypeScript · Stanford · 3-Week Sprint
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-line">
              <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-blue to-teal" />
            </div>
            <span className="whitespace-nowrap text-xs font-semibold text-teal">Ready to sync</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
