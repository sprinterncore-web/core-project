'use client'

import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import LogoMarquee from '@/components/LogoMarquee'
import ToggleSection from '@/components/ToggleSection'
import HowItWorks from '@/components/HowItWorks'
import SocialProof from '@/components/SocialProof'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'
import { testSupabaseConnection } from '@/lib/supabase/test-connection'

export default function HomePage() {
  useEffect(() => {
    testSupabaseConnection().then((ok) => {
      if (ok) console.log('✅ Ready to go')
    })
  }, [])

  return (
    <div className="min-h-screen bg-canvas font-sans">
      <Navbar />
      <main>
        <Hero />
        <LogoMarquee />
        <ToggleSection />
        <HowItWorks />
        <SocialProof />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
