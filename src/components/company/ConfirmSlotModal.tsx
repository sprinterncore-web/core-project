'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, Loader2 } from 'lucide-react'
import { updateApplicationStatus } from '@/lib/supabase/applications'
import type { Application } from '@/types/database'

type Props = {
  isOpen: boolean
  onClose: () => void
  application: Application | null
  selectedSlot: string
  onConfirm: () => void
}

export function ConfirmSlotModal({
  isOpen,
  onClose,
  application,
  selectedSlot,
  onConfirm,
}: Props) {
  const [confirming, setConfirming] = useState(false)

  return (
    <AnimatePresence>
      {isOpen && application ? (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="pointer-events-auto flex w-full max-w-md flex-col rounded-3xl bg-white shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 2rem)' }}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 overflow-y-auto p-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-teal/20 bg-teal-wash">
                  <CalendarCheck size={28} className="text-teal" />
                </div>

                <h2 className="mt-5 text-center text-xl font-bold text-navy">
                  Confirm this interview?
                </h2>

                <div className="mt-5 rounded-xl bg-canvas px-5 py-4">
                  <p className="text-base font-bold text-navy">
                    {application.student?.full_name ?? 'Student'}
                  </p>
                  <p className="mt-0.5 text-sm text-slate">
                    for {application.job_posting?.role_title}
                  </p>
                </div>

                <div className="mt-3 rounded-xl border border-blue/15 bg-blue/10 px-5 py-4">
                  <p className="text-lg font-bold text-navy">
                    {selectedSlot
                      ? new Date(selectedSlot).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : ''}{' '}
                    ·{' '}
                    {selectedSlot
                      ? new Date(selectedSlot).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : ''}
                  </p>
                  <p className="mt-1 text-sm text-slate">30-minute intro call</p>
                </div>

                <p className="mt-4 text-center text-sm leading-relaxed text-slate">
                  The student will see this confirmed time on their dashboard
                  immediately.
                </p>
              </div>

              <div className="flex flex-shrink-0 gap-3 p-6 pt-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-line py-3.5 text-sm font-semibold text-navy transition-all hover:border-navy"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirming}
                  onClick={async () => {
                    setConfirming(true)
                    await updateApplicationStatus(
                      application.id,
                      'interview_scheduled',
                      {
                        confirmed_slot: selectedSlot,
                      }
                    )
                    setConfirming(false)
                    onConfirm()
                    onClose()
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-teal py-3.5 text-sm font-bold text-white transition-all hover:bg-teal-dark disabled:opacity-60"
                >
                  {confirming ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Confirm Interview →'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
