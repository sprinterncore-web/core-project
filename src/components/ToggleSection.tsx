'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Banknote,
  ListChecks,
  MailX,
  PhoneOff,
  Rocket,
  ScanSearch,
  TrendingUp,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Tab = 'companies' | 'students'

type CardData = {
  icon: LucideIcon
  title: string
  body: string
  link: string
  iconClass: string
  iconWrap: string
}

const companyCards: CardData[] = [
  {
    icon: PhoneOff,
    title: 'No intake forms. Just a 20-min call.',
    body: 'Skip recruitment platforms. Tell our team what you need built, your stack, and delivery milestones — we handle the rest.',
    link: 'Direct consultation',
    iconWrap: 'bg-teal-wash',
    iconClass: 'text-teal',
  },
  {
    icon: ScanSearch,
    title: 'We profile your role and ideal student.',
    body: 'Our matching engine cross-references 12,000+ vetted builders across Tier-1 institutions for precise skill fit.',
    link: 'Calibrated matching',
    iconWrap: 'bg-teal-wash',
    iconClass: 'text-teal',
  },
  {
    icon: ListChecks,
    title: 'Get a curated shortlist — not 400 CVs.',
    body: 'Receive 2–3 pre-screened student profiles with verified GitHub commits, ready for your sprint review.',
    link: 'Verified portfolios',
    iconWrap: 'bg-teal-wash',
    iconClass: 'text-teal',
  },
  {
    icon: Rocket,
    title: 'Launch sprint projects in days, not weeks.',
    body: 'Zero HR overhead, pre-structured contracts, built-in IP assignment. First commits within 96 hours of kickoff.',
    link: 'Standardised NDA & IP',
    iconWrap: 'bg-teal-wash',
    iconClass: 'text-teal',
  },
]

const studentCards: CardData[] = [
  {
    icon: Zap,
    title: 'Real impact. Your schedule.',
    body: '2–4 week sprints embedded with startup founders. 10–15 hrs/week — no dropping coursework.',
    link: 'Flexible sprint formats',
    iconWrap: 'bg-blue/[0.08]',
    iconClass: 'text-blue',
  },
  {
    icon: MailX,
    title: 'No cover letters. No ghosting.',
    body: 'Complete your profile once. Our engine matches you directly to startups whose stack matches your skills.',
    link: 'Guaranteed review on match',
    iconWrap: 'bg-blue/[0.08]',
    iconClass: 'text-blue',
  },
  {
    icon: Banknote,
    title: 'Transparent milestone stipends.',
    body: 'Every sprint is milestone-funded. Pay deposited on deliverable approval — no chasing invoices.',
    link: 'Milestone-locked payments',
    iconWrap: 'bg-blue/[0.08]',
    iconClass: 'text-blue',
  },
  {
    icon: TrendingUp,
    title: 'A pipeline to full-time roles.',
    body: '78% of Sprintern alumni receive return offers or priority invites after completing their sprint milestone.',
    link: 'Founder endorsements',
    iconWrap: 'bg-blue/[0.08]',
    iconClass: 'text-blue',
  },
]

function FeatureCard({ card }: { card: CardData }) {
  const Icon = card.icon
  return (
    <motion.div
      className="rounded-2xl border border-line bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      whileHover={{ y: -2 }}
    >
      <div
        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${card.iconWrap}`}
      >
        <Icon className={card.iconClass} size={22} />
      </div>
      <h3 className="text-[17px] font-bold leading-snug text-navy">{card.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate">{card.body}</p>
      <a
        href="#"
        className="group mt-5 flex items-center gap-1 text-sm font-semibold text-blue transition-all duration-150 hover:gap-2"
      >
        {card.link}
        <ArrowRight size={14} />
      </a>
    </motion.div>
  )
}

export default function ToggleSection() {
  const [active, setActive] = useState<Tab>('companies')
  const cards = active === 'companies' ? companyCards : studentCards

  return (
    <section id="toggle-section" className="bg-canvas px-6 py-24">
      <div className="mb-14 flex justify-center">
        <div className="relative inline-flex gap-1 rounded-full bg-line/60 p-1.5">
          {(['companies', 'students'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className="relative rounded-full px-7 py-2.5 text-sm font-semibold"
            >
              {active === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 z-0 rounded-full bg-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 transition-colors ${
                  active === tab ? 'text-navy' : 'text-slate hover:text-navy'
                }`}
              >
                {tab === 'companies' ? 'Companies' : 'Students'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2"
        >
          {cards.map((card) => (
            <FeatureCard key={card.title} card={card} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
