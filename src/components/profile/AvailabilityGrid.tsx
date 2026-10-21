'use client'

import { motion } from 'framer-motion'
import type { AvailabilityHours } from '@/types/database'
import { countAvailabilitySlots } from '@/lib/profileCompletion'

const DAYS: Array<keyof AvailabilityHours> = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
]
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8)

type Props = {
  availabilityHours: AvailabilityHours
  hoursPerWeek: number
  onChange: (hours: AvailabilityHours, total: number) => void
}

export function AvailabilityGrid({
  availabilityHours,
  onChange,
}: Props) {
  const totalSelectedHours = countAvailabilitySlots(availabilityHours)

  const badgeClass =
    totalSelectedHours < 10
      ? 'border border-red-200 bg-red-50 text-red-600'
      : totalSelectedHours <= 14
        ? 'border border-amber-200 bg-amber-50 text-amber-700'
        : 'border border-teal/20 bg-teal-wash text-teal'

  function toggle(day: keyof AvailabilityHours, hour: number) {
    const current = availabilityHours[day] ?? []
    const next = current.includes(hour)
      ? current.filter((h) => h !== hour)
      : [...current, hour].sort((a, b) => a - b)
    const updated = { ...availabilityHours, [day]: next }
    onChange(updated, countAvailabilitySlots(updated))
  }

  function setBulk(next: AvailabilityHours) {
    onChange(next, countAvailabilitySlots(next))
  }

  function formatHour(h: number) {
    if (h === 12) return '12 PM'
    if (h > 12) return `${h - 12} PM`
    return `${h} AM`
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-navy">Sprint Availability</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}
        >
          {totalSelectedHours} hrs/week selected
        </span>
      </div>
      <p className="mt-1 mb-6 text-sm text-slate">
        Click to toggle available hours. Companies see this when reviewing your
        profile.
      </p>

      <div className="overflow-x-auto">
        <div className="mb-2 grid min-w-[520px] grid-cols-8 gap-1">
          <div />
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold uppercase text-slate/60"
            >
              {d}
            </div>
          ))}
        </div>
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="mb-1 grid min-w-[520px] grid-cols-8 items-center gap-1"
          >
            <div className="pr-2 text-right text-[10px] font-medium text-slate/40">
              {formatHour(hour)}
            </div>
            {DAYS.map((day) => {
              const selected = (availabilityHours[day] ?? []).includes(hour)
              return (
                <motion.button
                  key={day}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggle(day, hour)}
                  className={`aspect-square w-full rounded-md transition-all duration-100 ${
                    selected
                      ? 'bg-teal hover:bg-teal-dark'
                      : 'bg-canvas hover:bg-line/80'
                  }`}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setBulk({})}
          className="cursor-pointer text-xs font-medium text-red-500 hover:underline"
        >
          Clear all
        </button>
        {[
          {
            label: 'Weekday mornings',
            fn: () => {
              const patch: AvailabilityHours = { ...availabilityHours }
              ;(['mon', 'tue', 'wed', 'thu', 'fri'] as const).forEach((d) => {
                patch[d] = Array.from(
                  new Set([...(patch[d] ?? []), 9, 10, 11])
                ).sort((a, b) => a - b)
              })
              setBulk(patch)
            },
          },
          {
            label: 'Weekday evenings',
            fn: () => {
              const patch: AvailabilityHours = { ...availabilityHours }
              ;(['mon', 'tue', 'wed', 'thu', 'fri'] as const).forEach((d) => {
                patch[d] = Array.from(
                  new Set([...(patch[d] ?? []), 18, 19, 20])
                ).sort((a, b) => a - b)
              })
              setBulk(patch)
            },
          },
          {
            label: 'Weekends',
            fn: () => {
              const patch: AvailabilityHours = { ...availabilityHours }
              ;(['sat', 'sun'] as const).forEach((d) => {
                patch[d] = Array.from(
                  new Set([...(patch[d] ?? []), 10, 11, 14, 15, 16])
                ).sort((a, b) => a - b)
              })
              setBulk(patch)
            },
          },
        ].map(({ label, fn }) => (
          <button
            key={label}
            type="button"
            onClick={fn}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-slate hover:border-navy"
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate">
        You&apos;ve selected approximately {totalSelectedHours} hours of
        availability per week.
      </p>
    </div>
  )
}
