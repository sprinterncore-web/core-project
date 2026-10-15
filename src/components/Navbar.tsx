import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Zap } from 'lucide-react'
import { useScrollY } from '../hooks/useScrollY'

const navLinks = [
  { label: 'For Companies', href: '#' },
  { label: 'For Students', href: '#' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '#' },
]

export default function Navbar() {
  const scrollY = useScrollY()
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrolled = scrollY >= 80

  const barClass = scrolled
    ? 'bg-white/95 backdrop-blur-md border-b border-line shadow-[0_1px_12px_rgba(10,22,40,0.06)]'
    : 'bg-canvas/80 backdrop-blur-md'

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50">
      <nav
        className={`h-[72px] transition-all duration-300 ${barClass}`}
      >
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
          <a href="#" className="flex items-baseline gap-0">
            <span className="mr-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue to-teal">
              <Zap size={20} className="text-white" />
            </span>
            <span className="text-xl font-bold text-navy">sprint</span>
            <span className="text-xl font-bold text-teal">ern</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate transition-colors duration-150 hover:text-navy"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center md:flex">
            <a
              href="#"
              className="mr-2 text-sm font-medium text-slate transition-colors hover:text-navy"
            >
              Log in
            </a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,201,167,0.3)] transition-all duration-200 hover:bg-teal-dark"
            >
              Book a Call
            </motion.a>
          </div>

          <button
            type="button"
            className="text-navy md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="border-b border-line bg-white px-6 py-6 shadow-lg md:hidden"
          >
            <div className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={closeMobile}
                  className="text-base font-medium text-navy"
                >
                  {link.label}
                </a>
              ))}
              <motion.a
                href="#"
                onClick={closeMobile}
                whileTap={{ scale: 0.97 }}
                className="mt-2 w-full rounded-full bg-teal py-3 text-center text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,201,167,0.3)]"
              >
                Book a Call
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
