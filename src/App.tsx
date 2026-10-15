import Navbar from './components/Navbar'
import Hero from './components/Hero'
import LogoMarquee from './components/LogoMarquee'
import ToggleSection from './components/ToggleSection'
import HowItWorks from './components/HowItWorks'
import SocialProof from './components/SocialProof'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

export default function App() {
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
