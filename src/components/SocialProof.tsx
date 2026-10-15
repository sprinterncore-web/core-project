import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'

function StatBlock({
  value,
  label,
  valueClass,
  animateCounter,
  inView,
  reducedMotion,
}: {
  value: string
  label: string
  valueClass: string
  animateCounter?: boolean
  inView: boolean
  reducedMotion: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!animateCounter) return
    if (reducedMotion) {
      setCount(94)
      return
    }
    if (!inView) {
      setCount(0)
      return
    }
    let frame = 0
    setCount(0)
    const id = window.setInterval(() => {
      frame += 1
      setCount(Math.min(94, Math.round((frame / 30) * 94)))
      if (frame >= 30) clearInterval(id)
    }, 40)
    return () => clearInterval(id)
  }, [animateCounter, inView, reducedMotion])

  const display = animateCounter ? `${count}%` : value

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={inView || reducedMotion ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-xl bg-canvas p-4 text-center"
    >
      <div className={`text-2xl font-bold ${valueClass}`}>{display}</div>
      <div className="mt-1 text-xs text-slate/60">{label}</div>
    </motion.div>
  )
}

export default function SocialProof() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reducedMotion = useReducedMotion()
  const show = inView || reducedMotion

  return (
    <motion.section
      ref={ref}
      className="mx-auto max-w-[1280px] px-6 py-24"
      initial={reducedMotion ? false : { opacity: 0, y: 32 }}
      animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-3xl border border-line bg-white p-8 shadow-sm lg:col-span-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal">
              Real-Time Platform Velocity
            </p>
            <h3 className="mt-2 text-2xl font-bold text-navy">Engineered for immediate velocity</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              Startups match with early talent whose skills map directly onto urgent roadmap tickets.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-canvas p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate">Sprint Placement Speed (Hours)</span>
              <span className="text-xs font-bold text-teal">Median: 74 hrs</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 500 80" aria-hidden>
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00C9A7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,72 C80,68 120,50 200,38 S340,18 420,10 L500,6 L500,80 L0,80 Z"
                fill="url(#sparkGrad)"
              />
              <motion.path
                d="M0,72 C80,68 120,50 200,38 S340,18 420,10 L500,6"
                stroke="#00C9A7"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: reducedMotion ? 1 : 0 }}
                animate={{ pathLength: show ? 1 : 0 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
              />
              {[
                { cx: 200, cy: 38, r: 4, fill: '#00C9A7' },
                { cx: 340, cy: 20, r: 4, fill: '#2E6FF3' },
                { cx: 500, cy: 6, r: 5, fill: '#00C9A7' },
              ].map((dot) => (
                <motion.circle
                  key={`${dot.cx}-${dot.cy}`}
                  cx={dot.cx}
                  cy={dot.cy}
                  r={dot.r}
                  fill={dot.fill}
                  initial={{ opacity: reducedMotion ? 1 : 0 }}
                  animate={{ opacity: show ? 1 : 0 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                />
              ))}
            </svg>
            <div className="mt-2 flex justify-between text-[10px] text-slate/50">
              <span>Day 1 (Call)</span>
              <span>Day 2 (Match)</span>
              <span>Day 3 (Intro)</span>
              <span>Day 4 (Kickoff)</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatBlock
              value="94%"
              label="Completion Rate"
              valueClass="text-navy"
              animateCounter
              inView={inView}
              reducedMotion={reducedMotion}
            />
            <StatBlock
              value="< 4.2d"
              label="Time to Deploy"
              valueClass="text-teal"
              inView={inView}
              reducedMotion={reducedMotion}
            />
            <StatBlock
              value="4.9 / 5"
              label="Founder NPS"
              valueClass="text-blue"
              inView={inView}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>

        <div className="flex flex-col rounded-3xl border border-line bg-white p-7 shadow-sm lg:col-span-5">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal">
              Candidate Spotlight
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/25 bg-teal-wash px-3 py-1 text-xs font-semibold text-teal">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-teal" />
              Live Match
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue to-teal text-lg font-bold text-white">
              MC
            </div>
            <div>
              <p className="text-lg font-bold text-navy">Maya Chen</p>
              <p className="mt-0.5 text-sm text-slate">UC Berkeley · CS & Data Science &apos;26</p>
              <p className="mt-1 text-[13px] font-semibold text-blue">
                Matched: AI Agent Backend Sprint
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-canvas p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-navy">Stack Calibration</span>
              <span className="text-sm font-bold text-teal">99% Fit</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['FastAPI', 'PostgreSQL', 'LangChain', 'Docker', 'Next.js'].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-navy"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue to-teal"
                initial={{ width: reducedMotion ? '99%' : '0%' }}
                animate={{ width: show ? '99%' : '0%' }}
                transition={{ duration: 1.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          <blockquote className="mt-6 border-l-2 border-teal/30 pl-4 text-sm italic leading-relaxed text-slate">
            &ldquo;Sprintern matched me with a Series A team in 3 days. I shipped their customer
            webhooks in our two-week sprint.&rdquo;
          </blockquote>

          <motion.a
            href="#"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue py-3.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue/90"
          >
            Find Talent Like Maya
            <ArrowRight size={16} />
          </motion.a>
        </div>
      </div>
    </motion.section>
  )
}
