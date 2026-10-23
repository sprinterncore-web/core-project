'use client'

import { useEffect, useState } from 'react'
import { UNIVERSITY_NAMES_FALLBACK } from '@/data/universities-fallback'
import { getUniversities } from '@/lib/supabase/universities'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20'

type Props = {
  value: string
  onChange: (val: string) => void
  required?: boolean
}

export function UniversitySelect({ value, onChange, required }: Props) {
  const [options, setOptions] = useState<string[]>([...UNIVERSITY_NAMES_FALLBACK])
  const [customUniversity, setCustomUniversity] = useState('')

  useEffect(() => {
    getUniversities().then((rows) => {
      if (rows.length > 0) {
        const names = rows.map((u) => u.name)
        if (!names.includes('Other')) names.push('Other')
        setOptions(names)
      }
    })
  }, [])

  const selectValue =
    value === 'Other' || (value && !options.includes(value))
      ? 'Other'
      : value

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-navy">
        University {required ? '*' : ''}
      </label>
      <select
        required={required}
        className={inputClass}
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value
          if (next === 'Other') {
            onChange('Other')
            setCustomUniversity('')
          } else {
            onChange(next)
            setCustomUniversity('')
          }
        }}
      >
        <option value="" disabled>
          Select your university
        </option>
        {options.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {selectValue === 'Other' && (
        <input
          required={required}
          className={`${inputClass} mt-3`}
          placeholder="Enter your university name *"
          value={customUniversity}
          onChange={(e) => {
            setCustomUniversity(e.target.value)
            onChange(e.target.value.trim() || 'Other')
          }}
        />
      )}
    </div>
  )
}
