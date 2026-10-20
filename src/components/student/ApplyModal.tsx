'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, Link2, Loader2 } from 'lucide-react'
import { submitApplication } from '@/lib/supabase/applications'
import type { JobPosting } from '@/types/database'

type Props = {
  isOpen: boolean
  onClose: () => void
  job: JobPosting | null
  studentId: string
  onSuccess: () => void
}

export function ApplyModal({
  isOpen,
  onClose,
  job,
  studentId,
  onSuccess,
}: Props) {
  const [pitch, setPitch] = useState('')
  const [resumeLink, setResumeLink] = useState('')
  const [slot1, setSlot1] = useState('')
  const [slot2, setSlot2] = useState('')
  const [slot3, setSlot3] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setPitch('')
      setResumeLink('')
      setSlot1('')
      setSlot2('')
      setSlot3('')
      setStep(1)
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => {
      onSuccess()
      onClose()
    }, 2000)
    return () => clearTimeout(t)
  }, [success, onSuccess, onClose])

  if (!job) return null

  const minSlot = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16)
  const maxSlot = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16)

  async function handleSubmit() {
    if (!slot1) {
      setError('Please select your first interview time.')
      return
    }
    const slotDate = new Date(slot1)
    if (slotDate.getTime() < Date.now() + 24 * 60 * 60 * 1000) {
      setError('First choice must be at least 24 hours from now.')
      return
    }
    if (!job?.company_id) {
      setError('This listing is not linked to a company yet.')
      return
    }

    setLoading(true)
    setError(null)
    const { error: submitError } = await submitApplication({
      student_id: studentId,
      job_posting_id: job.id,
      company_id: job.company_id,
      pitch: pitch.trim(),
      resume_link: resumeLink.trim() || null,
      proposed_slot_1: slotDate.toISOString(),
      proposed_slot_2: slot2 ? new Date(slot2).toISOString() : null,
      proposed_slot_3: slot3 ? new Date(slot3).toISOString() : null,
    })

    if (submitError) {
      if (submitError.toLowerCase().includes('unique')) {
        setError('You have already applied to this position.')
      } else {
        setError(submitError)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {success ? (
                <div className="px-7 py-12 text-center">
                  <CheckCircle2 size={48} className="mx-auto text-teal" />
                  <h3 className="mt-4 text-xl font-bold text-navy">
                    Application submitted!
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-slate">
                    The company will review your application and confirm one of
                    your proposed interview times.
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-7 pt-7">
                    <h2 className="text-xl font-bold text-navy">
                      Apply to {job.company_name}
                    </h2>
                    <p className="mt-1 text-sm text-slate">{job.role_title}</p>
                    <div className="mt-5 flex gap-2 text-xs">
                      <span
                        className={`rounded-full px-4 py-1.5 font-semibold ${
                          step === 1
                            ? 'bg-navy text-white'
                            : 'text-slate/50'
                        }`}
                      >
                        1. Your Pitch
                      </span>
                      <span className="text-slate/30">·</span>
                      <span
                        className={`rounded-full px-4 py-1.5 font-semibold ${
                          step === 2
                            ? 'bg-navy text-white'
                            : 'text-slate/50'
                        }`}
                      >
                        2. Interview Times
                      </span>
                    </div>
                  </div>

                  {step === 1 ? (
                    <div className="flex flex-col gap-5 px-7 py-6">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-navy">
                          Why are you a great fit for this sprint? *
                        </label>
                        <textarea
                          rows={5}
                          value={pitch}
                          onChange={(e) =>
                            setPitch(e.target.value.slice(0, 500))
                          }
                          placeholder="Be specific — mention your relevant stack experience..."
                          className="w-full rounded-xl border border-line px-4 py-3 text-sm text-navy outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
                        />
                        <p className="mt-1 text-right text-xs text-slate/50">
                          {pitch.length} / 500
                        </p>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-navy">
                          Google Drive resume link
                        </label>
                        <div className="relative">
                          <Link2
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/40"
                          />
                          <input
                            type="url"
                            value={resumeLink}
                            onChange={(e) => setResumeLink(e.target.value)}
                            placeholder="https://drive.google.com/file/d/..."
                            className="w-full rounded-xl border border-line py-3 pl-10 pr-4 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-slate/50">
                          Make sure your Drive link is set to &apos;Anyone with
                          the link can view&apos;
                        </p>
                      </div>
                      {error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {error}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          if (pitch.trim().length < 50) {
                            setError('Pitch must be at least 50 characters.')
                            return
                          }
                          if (
                            resumeLink &&
                            !/^https?:\/\/.+/i.test(resumeLink.trim())
                          ) {
                            setError('Resume link must be a valid URL.')
                            return
                          }
                          setError(null)
                          setStep(2)
                        }}
                        className="w-full rounded-full bg-navy py-3.5 text-sm font-bold text-white"
                      >
                        Continue to Interview Times →
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6 px-7 py-6">
                      <div>
                        <p className="text-lg font-bold text-navy">
                          Propose up to 3 times that work for you
                        </p>
                        <p className="mt-1 text-sm text-slate">
                          The company will confirm one of these slots. All times
                          are in your local timezone.
                        </p>
                      </div>
                      {[
                        ['First choice *', slot1, setSlot1, true],
                        ['Second choice (optional)', slot2, setSlot2, false],
                        ['Third choice (optional)', slot3, setSlot3, false],
                      ].map(([label, val, setter]) => (
                        <div key={String(label)}>
                          <label className="mb-2 block text-sm font-semibold text-navy">
                            {label as string}
                          </label>
                          <input
                            type="datetime-local"
                            value={val as string}
                            min={minSlot}
                            max={maxSlot}
                            onChange={(e) =>
                              (setter as (v: string) => void)(e.target.value)
                            }
                            className="w-full rounded-xl border border-line px-4 py-3 text-sm text-navy focus:border-blue focus:ring-2 focus:ring-blue/10"
                          />
                        </div>
                      ))}
                      <div className="rounded-xl border border-blue/15 bg-blue/5 px-5 py-4">
                        <p className="text-sm text-navy">
                          <Info
                            size={15}
                            className="mr-2 inline text-blue"
                          />
                          Each slot should be at least 30 minutes. The company
                          will pick the best time and confirm via the platform.
                        </p>
                      </div>
                      {error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {error}
                        </div>
                      ) : null}
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-sm font-medium text-slate hover:text-navy"
                        >
                          ← Back
                        </button>
                        <motion.button
                          type="button"
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleSubmit}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-teal py-3.5 text-sm font-bold text-white disabled:opacity-70"
                        >
                          {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : null}
                          Submit Application →
                        </motion.button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
