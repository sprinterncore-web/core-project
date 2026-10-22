'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GraduationCap, Rocket } from 'lucide-react'
import Navbar from '@/components/Navbar'

const studentSteps = [
  'Submit your profile',
  'Accept a founder meeting request',
  'Complete sprint & get paid',
]

const founderSteps = [
  'Get matched with students',
  'Book an intro call',
  'Confirm sprint & launch',
]

function PathCard({
  accent,
  icon: Icon,
  title,
  description,
  steps,
  cta,
  href,
}: {
  accent: 'teal' | 'blue'
  icon: typeof GraduationCap
  title: string
  description: string
  steps: string[]
  cta: string
  href: string
}) {
  const router = useRouter()
  const isTeal = accent === 'teal'

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => router.push(href)}
      className="group cursor-pointer rounded-3xl border border-line bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
          isTeal ? 'bg-teal-wash' : 'bg-blue/8'
        }`}
      >
        <Icon size={32} className={isTeal ? 'text-teal' : 'text-blue'} />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-navy">{title}</h2>
      <p className="mt-3 text-base leading-relaxed text-slate">{description}</p>
      <div className="mt-6 flex flex-col gap-3">
        {steps.map((text, i) => (
          <div key={text} className="flex items-center gap-3">
            <span
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                isTeal ? 'bg-teal' : 'bg-blue'
              }`}
            >
              {i + 1}
            </span>
            <span className="text-sm font-medium text-navy">{text}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={`mt-8 w-full rounded-full py-3.5 text-sm font-bold text-white transition-colors ${
          isTeal
            ? 'bg-teal group-hover:bg-teal-dark'
            : 'bg-blue group-hover:bg-blue/90'
        }`}
      >
        {cta}
      </button>
    </motion.div>
  )
}

export default function LandingHero() {
  const pathsRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <Navbar onGetStarted={() => pathsRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-20 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-[0.25]">
          <svg width="100%" height="100%" aria-hidden>
            <defs>
              <pattern
                id="landing-dots"
                x="0"
                y="0"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1.5" cy="1.5" r="1.5" fill="#CBD5E1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#landing-dots)" />
          </svg>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[280px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/[0.12] blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-navy md:text-6xl">
            The sprint platform for{' '}
            <span className="text-teal">students and founders.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg text-slate md:text-xl">
            AI-matched sprint projects. Real work. Real pay.
          </p>

          <div
            ref={pathsRef}
            id="get-started"
            className="mx-auto mt-14 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2"
          >
            <PathCard
              accent="teal"
              icon={GraduationCap}
              title="I'm a Student"
              description="Submit your profile, get matched with founders, complete sprints, get paid."
              steps={studentSteps}
              cta="Get started →"
              href="/auth/signup"
            />
            <PathCard
              accent="blue"
              icon={Rocket}
              title="I'm a Founder"
              description="Get matched with vetted students, book an intro call, confirm your sprint."
              steps={founderSteps}
              cta="Start hiring →"
              href="/company/signup"
            />
          </div>
        </div>

      </section>
    </>
  )
}
