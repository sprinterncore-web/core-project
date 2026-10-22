'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link2, MessageSquarePlus, Star } from 'lucide-react'

function AnimatedCard({
  children,
  delay,
  className,
}: {
  children: React.ReactNode
  delay: number
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Testimonials() {
  return (
    <section className="bg-canvas px-6 py-20">
      <h2 className="mb-14 text-center text-3xl font-bold tracking-tight text-navy">
        What founders are saying
      </h2>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        <AnimatedCard
          delay={0}
          className="flex flex-col rounded-3xl border border-line bg-white p-8 shadow-sm"
        >
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-navy to-teal text-sm font-bold text-white">
                AG
              </div>
              <div>
                <p className="text-base font-bold text-navy">Adarsh Gupta</p>
                <a
                  href="https://www.linkedin.com/in/adarsh-gupta-2023/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-blue hover:underline"
                >
                  <Link2 size={12} />
                  LinkedIn
                </a>
              </div>
            </div>
            <span className="rounded-full border border-line bg-canvas px-3 py-1 text-sm font-semibold text-navy">
              Topit AI
            </span>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {['GTM Strategy Sprint', '2 Sprinterns', '3 Weeks'].map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-teal/20 bg-teal-wash px-3 py-1 text-xs font-semibold text-teal"
              >
                {pill}
              </span>
            ))}
          </div>

          <div>
            <span className="mb-2 block font-serif text-6xl leading-none text-teal">
              &ldquo;
            </span>
            <blockquote className="text-sm font-medium italic leading-relaxed text-navy">
              I am working with two interns from Sprintern and they have been
              amazing! They onboarded within 48 hours and got to work less than a
              day after that! They both have expanded their scopes past what was
              exactly written to better fit their backgrounds and experience in
              graphic and video design and outreach, while taking initiative to
              improve other functions of the startup. They were easy to communicate
              with and even integrated effortlessly with others on the team.
              Thank you Sprintern for making the perfect intern solution!
            </blockquote>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-line pt-6">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="rounded-full border border-teal/20 bg-teal-wash px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal">
              Verified Founder
            </span>
          </div>
        </AnimatedCard>

        <AnimatedCard
          delay={0.1}
          className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-line bg-canvas p-8 text-center"
        >
          <MessageSquarePlus size={32} className="mx-auto text-slate/25" />
          <p className="mt-5 text-lg font-bold text-navy">
            Student story coming soon
          </p>
          <p className="mx-auto mt-2 max-w-[240px] text-sm leading-relaxed text-slate">
            We&apos;re collecting our first student testimonials from the current
            sprint cohort.
          </p>
          <span className="mt-5 rounded-full border border-teal/20 bg-teal-wash px-4 py-1.5 text-xs font-semibold text-teal">
            UC Berkeley · Sprint Cohort #1
          </span>
        </AnimatedCard>
      </div>
    </section>
  )
}
