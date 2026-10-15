'use client'

import Link from 'next/link'
import { Calendar, Rocket, Users, Zap } from 'lucide-react'

export default function BookPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
        <Link href="/" className="flex items-baseline gap-0">
          <span className="mr-2.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
            <Zap size={18} className="text-white" />
          </span>
          <span className="text-lg font-bold text-navy">sprint</span>
          <span className="text-lg font-bold text-teal">ern</span>
        </Link>
        <Link href="/" className="text-sm font-semibold text-teal hover:underline">
          Back to home
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-12 pt-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal-wash px-4 py-1.5 text-xs font-semibold text-teal">
          ● For Companies
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy">
          Book your 20-minute intro call
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate">
          Tell us what you&apos;re building and what kind of student talent you
          need. We handle everything after the call.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-10">
          {[
            {
              icon: Calendar,
              title: '20 minutes',
              sub: 'No prep needed',
            },
            {
              icon: Users,
              title: 'Curated shortlist',
              sub: '2–3 matched students',
            },
            {
              icon: Rocket,
              title: 'Launch in days',
              sub: 'First commits in 96hrs',
            },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-wash">
                <Icon size={20} className="text-teal" />
              </div>
              <span className="text-sm font-semibold text-navy">{title}</span>
              <span className="text-xs text-slate">{sub}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
          <div className="flex min-h-[650px] flex-col items-center justify-center gap-6 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal/20 bg-teal-wash">
              <Calendar size={28} className="text-teal" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-navy">
                Calendly booking coming soon
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate">
                Our scheduling link will be embedded here. In the meantime, email
                us at{' '}
                <a
                  href="mailto:hello@sprintern.co"
                  className="font-semibold text-teal hover:underline"
                >
                  hello@sprintern.co
                </a>
              </p>
            </div>
            {/*
              CALENDLY INTEGRATION INSTRUCTIONS (leave as comment in code):

              To activate Calendly:
              1. Add this script to app/layout.tsx head:
                 <script src="https://assets.calendly.com/assets/external/widget.js" async />
              2. Replace this placeholder div with:
                 <div
                   className="calendly-inline-widget w-full"
                   data-url="https://calendly.com/YOUR_LINK_HERE"
                   style={{ minHeight: '650px' }}
                 />
              3. Remove the placeholder content above
            */}
          </div>
        </div>
      </section>
    </div>
  )
}
