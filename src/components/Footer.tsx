import { AtSign, Globe, MessageCircle, Zap } from 'lucide-react'

const footerLinks = ['For Companies', 'For Students', 'Privacy', 'Terms']

export default function Footer() {
  return (
    <footer id="about" className="border-t-[3px] border-teal/50 bg-navy">
      <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-10 px-6 py-14 md:flex-row">
        <div>
          <div className="flex items-baseline">
            <span className="mr-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
              <Zap size={20} className="text-white" />
            </span>
            <span className="text-xl font-bold text-white">sprint</span>
            <span className="text-xl font-bold text-teal">ern</span>
          </div>
          <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-white/40">
            High-velocity matching between student builders and high-growth startup sprints.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-white/35 transition-colors duration-150 hover:text-white/70"
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-5 md:mt-0 md:items-end">
          <div className="flex gap-3">
            {[Globe, MessageCircle, AtSign].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-white/35 transition-all duration-150 hover:border-white/35 hover:text-white"
                aria-label="Social link"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
          <p className="text-xs text-white/25">© 2026 Sprintern. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
