import { Check, Rocket, Zap } from 'lucide-react'

const features = [
  'Get matched with vetted students',
  'Book an intro call — no forms',
  'Confirm sprint & launch in days',
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

        <div className="mt-12 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue/15">
          <Rocket size={32} className="text-blue" />
        </div>

        <h2 className="mt-8 text-3xl font-bold text-white">
          Launch your first sprint
        </h2>

        <ul className="mt-10 space-y-4">
          {features.map((text) => (
            <li key={text} className="flex items-start gap-3 text-white/80">
              <Check size={18} className="mt-0.5 flex-shrink-0 text-teal" />
              <span className="text-sm">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
