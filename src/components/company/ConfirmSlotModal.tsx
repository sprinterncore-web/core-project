'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, Loader2 } from 'lucide-react'
import { formatInterviewDateTime } from '@/lib/format'
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
  const [loading, setLoading] = useState(false)

  if (!application) return null

  const { dateStr, timeStr } = formatInterviewDateTime(selectedSlot)
  const student = application.student
  const job = application.job_posting

  async function handleConfirm() {
    setLoading(true)
    await updateApplicationStatus(application!.id, 'interview_scheduled', {
      confirmed_slot: selectedSlot,
    })
    setLoading(false)
    onConfirm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-wash">
              <CalendarCheck size={40} className="text-teal" />
            </div>
            <h2 className="mt-5 text-center text-xl font-bold text-navy">
              Confirm this interview?
            </h2>
            <div className="mt-4 rounded-xl bg-canvas px-5 py-4">
              <p className="font-bold text-navy">
                {student?.full_name ?? 'Student'}
              </p>
              <p className="text-sm text-slate">
                for {job?.role_title ?? 'this role'}
              </p>
            </div>
            <div className="mt-3 rounded-xl bg-blue/10 px-5 py-4">
              <p className="text-lg font-bold text-navy">
                {dateStr} · {timeStr}
              </p>
              <p className="mt-1 text-sm text-slate">30-minute intro call</p>
            </div>
            <p className="mt-4 text-center text-sm text-slate">
              The student will see this confirmed time on their dashboard
              immediately.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-line py-3 text-sm font-semibold text-navy"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-teal py-3.5 text-sm font-bold text-white disabled:opacity-70"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                Confirm Interview →
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
