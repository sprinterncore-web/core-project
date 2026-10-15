'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Step1Profile } from '@/components/onboarding/Step1Profile'
import { Step2Experience } from '@/components/onboarding/Step2Experience'
import { Step3Skills } from '@/components/onboarding/Step3Skills'
import { Step4AIMatch } from '@/components/onboarding/Step4AIMatch'

export default function OnboardingStepPage() {
  const params = useParams()
  const router = useRouter()
  const step = parseInt(String(params.step), 10)

  useEffect(() => {
    if (Number.isNaN(step) || step < 1 || step > 4) {
      router.replace('/onboarding/step/1')
    }
  }, [step, router])

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(async () => {
        try {
          await fetch('/api/match', { method: 'POST' })
        } catch {
          // Fail silently — dashboard will show dummy data as fallback
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [step])

  if (Number.isNaN(step) || step < 1 || step > 4) {
    return null
  }

  switch (step) {
    case 1:
      return <Step1Profile />
    case 2:
      return <Step2Experience />
    case 3:
      return <Step3Skills />
    case 4:
      return <Step4AIMatch />
    default:
      return null
  }
}
