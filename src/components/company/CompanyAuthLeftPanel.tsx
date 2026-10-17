import { Check, Zap } from 'lucide-react'

const features = [
  'No intake forms — just a 20-min call',
  'Curated student shortlist in 48hrs',
  'First commits within 96 hours of kickoff',
]

export function CompanyAuthLeftPanel() {
  return (
    <div className="fixed inset-y-0 left-0 hidden w-1/2 bg-gradient-to-br from-navy to-[#0D1F3C] lg:block">
      <div className="flex h-full flex-col px-12 py-16">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
            <Zap size={20} className="text-white" />
          </span>
          <span className="text-xl font-bold text-white">sprint</span>
          <span className="text-xl font-bold text-teal">ern</span>
        </div>

        <h2 className="mt-12 text-3xl font-bold text-white">
          Partner with top student builders
        </h2>
        <p className="mt-3 max-w-xs text-base text-white/60">
          Book a call, we handle onboarding, you get matched talent ready to
          sprint.
        </p>

        <ul className="mt-10 space-y-4">
          {features.map((text) => (
            <li key={text} className="flex items-start gap-3 text-white/80">
              <Check size={18} className="mt-0.5 flex-shrink-0 text-teal" />
              <span className="text-sm">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-12">
          <p className="text-xs text-white/30">Trusted by</p>
          <p className="mt-2 text-xs text-white/40">
            Bland · DualEntry · Rocketlane · YC companies
          </p>
        </div>
      </div>
    </div>
  )
}
