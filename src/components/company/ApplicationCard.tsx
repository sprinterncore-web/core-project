'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { ApplicationStatusBadge } from '@/components/student/ApplicationStatusBadge'
import { ConfirmSlotModal } from '@/components/company/ConfirmSlotModal'
import { formatDate, formatSlotShort } from '@/lib/format'
import { initials } from '@/lib/format'
import { updateApplicationStatus } from '@/lib/supabase/applications'
import type { Application } from '@/types/database'

type Props = {
  application: Application
  onUpdated: () => void
}

export function ApplicationCard({ application, onUpdated }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [declining, setDeclining] = useState(false)

  const student = application.student
  const job = application.job_posting
  const slots = [
    application.proposed_slot_1,
    application.proposed_slot_2,
    application.proposed_slot_3,
  ].filter(Boolean) as string[]

  async function confirmDecline() {
    setDeclining(true)
    await updateApplicationStatus(application.id, 'declined', {
      decline_reason: declineReason.trim() || undefined,
    })
    setDeclining(false)
    setDeclineOpen(false)
    onUpdated()
  }

  return (
    <>
      <div className="mb-3 rounded-2xl border border-line bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
              {initials(
                student?.full_name ?? null,
                student?.email ?? 'ST'
              )}
            </div>
            <div>
              <p className="text-base font-bold text-navy">
                {student?.full_name ?? 'Student'}
              </p>
              <p className="text-sm text-slate">
                {[student?.university, student?.major, student?.graduation_year]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="text-xs text-slate/50">
                Applied {formatDate(application.created_at)}
              </p>
            </div>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>

        <div className="mt-4 rounded-xl bg-canvas px-5 py-4">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-slate/50">
            Student pitch
          </p>
          <p className="text-sm leading-relaxed text-navy">
            {application.pitch}
          </p>
        </div>

        {application.resume_link ? (
          <p className="mt-3 text-sm">
            <FileText size={15} className="mr-2 inline text-slate" />
            <a
              href={application.resume_link}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue hover:underline"
            >
              View resume on Google Drive →
            </a>
          </p>
        ) : null}

        {application.status === 'pending' ? (
          <>
            <p className="mb-3 mt-4 text-sm font-semibold text-navy">
              Proposed interview times
            </p>
            <div className="flex flex-col gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-xl px-5 py-3 text-left text-sm font-medium transition-all ${
                    selectedSlot === slot
                      ? 'bg-blue font-semibold text-white'
                      : 'border border-line bg-canvas text-navy hover:border-blue hover:bg-blue/5'
                  }`}
                >
                  {formatSlotShort(slot)}
                </button>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setConfirmOpen(true)}
                className="rounded-full bg-teal px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Accept & Confirm Interview →
              </button>
              <button
                type="button"
                onClick={() => setDeclineOpen((o) => !o)}
                className="rounded-full border border-red-200 px-5 py-3 text-sm text-red-500 transition-all hover:bg-red-50"
              >
                Decline
              </button>
            </div>

            {declineOpen ? (
              <div className="mt-4 border-t border-line pt-4">
                <textarea
                  rows={2}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="w-full rounded-xl border border-line px-4 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={declining}
                  onClick={confirmDecline}
                  className="mt-2 rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white"
                >
                  Confirm decline
                </button>
              </div>
            ) : null}
          </>
        ) : null}

        {application.status === 'interview_scheduled' &&
        application.confirmed_slot ? (
          <div className="mt-4 rounded-xl border border-blue/15 bg-blue/5 px-5 py-4">
            <p className="text-sm font-semibold text-blue">
              Interview confirmed for{' '}
              {formatSlotShort(application.confirmed_slot)}
            </p>
          </div>
        ) : null}

        {application.status === 'declined' && application.decline_reason ? (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm italic text-red-700">
            Feedback: {application.decline_reason}
          </div>
        ) : null}
      </div>

      <ConfirmSlotModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        application={application}
        selectedSlot={selectedSlot ?? ''}
        onConfirm={onUpdated}
      />
    </>
  )
}
