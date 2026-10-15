'use client'

import { motion } from 'framer-motion'
import { Briefcase, Check, Code2, Sparkles, User } from 'lucide-react'

const STEPS = [
  { num: 1, label: 'Profile', icon: User },
  { num: 2, label: 'Experience', icon: Briefcase },
  { num: 3, label: 'Skills', icon: Code2 },
  { num: 4, label: 'AI Match', icon: Sparkles },
]

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-start justify-center gap-0">
      {STEPS.map((step, i) => {
        const completed = step.num < currentStep
        const active = step.num === currentStep
        return (
          <div key={step.num} className="flex flex-1 items-start">
            <div className="flex flex-col items-center">
              <motion.div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  completed
                    ? 'bg-teal text-white'
                    : active
                      ? 'bg-navy text-white ring-4 ring-navy/10'
                      : 'bg-line text-slate'
                }`}
                animate={active ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {completed ? (
                  <Check size={14} />
                ) : (
                  step.num
                )}
              </motion.div>
              <span
                className={`mt-1.5 text-xs font-medium ${
                  active
                    ? 'text-navy'
                    : completed
                      ? 'text-teal'
                      : 'text-slate/50'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <div
                className={`mx-2 mt-4 h-0.5 flex-1 ${
                  step.num < currentStep ? 'bg-teal' : 'bg-line'
                }`}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
