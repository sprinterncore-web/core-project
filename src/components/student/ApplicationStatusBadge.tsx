import type { ApplicationStatus } from '@/types/database'

export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus
}) {
  switch (status) {
    case 'pending':
      return (
        <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700">
          ⏳ Application Pending
        </span>
      )
    case 'accepted':
      return (
        <span className="rounded-full border border-teal/20 bg-teal-wash px-4 py-2.5 text-xs font-semibold text-teal">
          ✓ Accepted — Interview Pending
        </span>
      )
    case 'declined':
      return (
        <span className="rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600">
          ✗ Not Selected
        </span>
      )
    case 'interview_scheduled':
      return (
        <span className="rounded-full border border-blue/20 bg-blue/10 px-4 py-2.5 text-xs font-semibold text-blue">
          📅 Interview Scheduled
        </span>
      )
    default:
      return null
  }
}
