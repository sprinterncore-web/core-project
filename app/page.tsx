'use client'

import LandingHero from '@/components/landing/LandingHero'
import Testimonials from '@/components/landing/Testimonials'
import LogoMarquee from '@/components/LogoMarquee'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans">
      <LandingHero />
      <LogoMarquee />
      <Testimonials />
      <Footer />
    </div>
  )
}
