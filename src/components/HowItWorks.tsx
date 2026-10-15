'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { BrainCircuit, CalendarCheck, CheckCircle2, UserCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'

type Step = {
  num: string
  icon: LucideIcon
  title: string
  body: string
  check: string
  from: { opacity: number; x?: number; y?: number }
}

const steps: Step[] = [
  {
    num: '01',
    icon: CalendarCheck,
    title: 'You book a 20-min call',
    body: 'Share your stack, project scope, and delivery milestones. Zero prep or documentation required before the call.',
    check: 'Zero pre-call documentation',
    from: { opacity: 0, x: -24 },
  },
  {
    num: '02',
    icon: BrainCircuit,
    title: 'We calibrate your match',
    body: 'Our AI and engineering panel screen verified university builders for exact skill, availability, and culture fit.',
    check: 'Vetted GitHub repositories',
    from: { opacity: 0, y: 24 },
  },
  {
    num: '03',
    icon: UserCheck,
    title: 'Receive profiles. Launch.',
    body: 'Review 2–3 matched students, run a quick chemistry check, and kick off your sprint project — friction-free.',
    check: 'Instant sprint onboarding kit',
    from: { opacity: 0, x: 24 },
  },
]

function Connector() {
  return (
    <div className="hidden shrink-0 items-center self-center md:flex">
      <div className="w-12 border-t-2 border-dashed border-line" />
    </div>
  )
}

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reducedMotion = useReducedMotion()

  return (
    <section id="how-it-works" ref={ref} className="bg-canvas px-6 py-24">
      <div className="mx-auto mb-16 max-w-xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-navy">
          Three steps. Days, not months.
        </h2>
        <p className="mt-4 text-lg text-slate">
          From your first call to deployed sprint talent — three simple milestones.
        </p>
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-stretch gap-6 md:flex-row">
        {steps.map((step, index) => {
          const Icon = step.icon
          const animate = reducedMotion || inView
          return (
            <div key={step.num} className="contents">
              {index > 0 && <Connector />}
              <motion.article
                className="flex-1 rounded-2xl border border-line bg-white p-8 shadow-sm"
                initial={reducedMotion ? false : step.from}
                animate={animate ? { opacity: 1, x: 0, y: 0 } : step.from}
                transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.15 }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-bold text-teal">{step.num}</span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-wash">
                    <Icon className="text-teal" size={24} />
                  </div>
                </div>
                <h3 className="mt-5 text-[17px] font-bold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{step.body}</p>
                <div className="mt-6 flex items-center gap-2 border-t border-line pt-5">
                  <CheckCircle2 size={15} className="text-teal" />
                  <span className="text-xs font-medium text-slate/70">{step.check}</span>
                </div>
              </motion.article>
            </div>
          )
        })}
      </div>
    </section>
  )
}
