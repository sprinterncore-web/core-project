import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight, CalendarCheck, Zap } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reducedMotion = useReducedMotion()
  const show = inView || reducedMotion

  return (
    <motion.section
      ref={ref}
      className="mx-auto mb-20 max-w-[1280px] px-6 py-10"
      initial={reducedMotion ? false : { opacity: 0, y: 40 }}
      animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-[#0D1F3C] to-[#0A1628] px-8 py-20 text-center md:px-16">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-2 border-teal/10 opacity-50"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue/[0.06] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-12 top-12 h-2 w-2 rounded-full bg-teal/20"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal/25 bg-teal/15">
            <Zap size={28} className="text-teal" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to kick off your next sprint?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/55">
            Schedule your 20-minute calibration call. We&apos;ll review your scope and deliver
            matched candidate profiles in days — not weeks.
          </p>
          <div className="mt-10 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
            <motion.a
              href="#"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-full bg-teal px-9 py-4 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,201,167,0.4)] transition-all duration-200 hover:bg-teal-dark hover:shadow-[0_6px_28px_rgba(0,201,167,0.55)]"
            >
              <CalendarCheck size={16} />
              Schedule Intro Session
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/15"
            >
              Apply as a Student
              <ArrowUpRight size={16} />
            </motion.a>
          </div>
          <p className="mt-8 text-xs text-white/30">
            No setup docs. No forms. Just a 20-min conversation.
          </p>
        </div>
      </div>
    </motion.section>
  )
}
