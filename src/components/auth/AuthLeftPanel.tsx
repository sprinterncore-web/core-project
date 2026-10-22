import { Check, Zap } from 'lucide-react'

const features = [
  'Submit your profile in 2 minutes',
  'Get matched with real sprint projects',
  'Earn while you build your portfolio',
]

const schools = [
  'UC Berkeley',
  'Stanford',
  'MIT',
  'CMU',
  'Y Combinator alumni',
]

export function AuthLeftPanel() {
  return (
    <div className="relative hidden min-h-screen w-1/2 flex-col overflow-hidden bg-gradient-to-br from-navy to-[#0D1F3C] lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-1/2">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
        aria-hidden
      >
        <defs>
          <pattern
            id="dot-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-teal/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col px-12 py-12">
        <a href="/" className="flex items-baseline gap-0">
          <span className="mr-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
            <Zap size={20} className="text-white" />
          </span>
          <span className="text-xl font-bold text-white">sprint</span>
          <span className="text-xl font-bold text-teal">ern</span>
        </a>

        <div className="mt-12 max-w-sm">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Join 2,000+ student builders
          </h2>
          <p className="mt-3 max-w-xs text-base leading-relaxed text-white/60">
            Match with high-growth startups. Ship real projects. Build your
            portfolio in weeks.
          </p>

          <ul className="mt-10 flex flex-col gap-4">
            {features.map((text) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/20">
                  <Check size={14} className="text-teal" />
                </span>
                <span className="text-sm text-white/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pb-12">
          <p className="text-xs uppercase tracking-wider text-white/40">
            Builders from
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {schools.map((name) => (
              <span
                key={name}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/50"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
