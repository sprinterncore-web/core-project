import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 py-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue to-teal">
            <Zap size={16} className="text-white" />
          </span>
          <span className="text-sm text-white/60">© 2026 Sprintern</span>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-xs text-white/40">
          <Link href="/privacy" className="hover:text-white/60">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white/60">
            Terms
          </Link>
          <a href="mailto:hello@sprintern.co" className="hover:text-white/60">
            hello@sprintern.co
          </a>
        </div>
      </div>
    </footer>
  )
}
