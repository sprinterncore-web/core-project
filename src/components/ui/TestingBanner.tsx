'use client'

import { FlaskConical } from 'lucide-react'
import { isTestingMode } from '@/lib/testing'

type Props = {
  enabled: boolean
  onChange: (val: boolean) => void
}

export function TestingBanner({ enabled, onChange }: Props) {
  if (!isTestingMode()) return null

  return (
    <div className="mb-6 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <FlaskConical size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Testing Mode</p>
            <p className="mt-0.5 text-xs text-amber-600">
              Bypasses email validation, allows duplicate accounts
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(!enabled)}
          className={`relative h-6 w-12 rounded-full transition-colors duration-200 ${
            enabled ? 'bg-amber-500' : 'bg-amber-200'
          }`}
          aria-pressed={enabled}
        >
          <div
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
              enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      {enabled ? (
        <div className="mt-3 border-t border-amber-200 pt-3">
          <p className="text-xs font-medium text-amber-700">⚠️ Active bypasses:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-amber-600">
            <li>.edu email requirement skipped</li>
            <li>Company work email requirement skipped</li>
            <li>Graduation year window skipped</li>
            <li>Duplicate email signup allowed (+timestamp suffix)</li>
            <li>Email confirmation check skipped on login</li>
          </ul>
        </div>
      ) : null}
    </div>
  )
}
