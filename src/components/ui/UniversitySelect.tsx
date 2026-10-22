'use client'

import { useEffect, useRef, useState } from 'react'
import { getUniversities } from '@/lib/supabase/universities'

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20'

type Props = {
  value: string
  onChange: (val: string) => void
  required?: boolean
}

export function UniversitySelect({ value, onChange, required }: Props) {
  const [universities, setUniversities] = useState<
    { id: number; name: string }[]
  >([])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const [otherText, setOtherText] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getUniversities().then(setUniversities)
  }, [])

  useEffect(() => {
    if (!open) setQuery(value)
  }, [value, open])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setQuery(value)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [value])

  const filtered = universities.filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase())
  )

  const showOther = value === 'Other' || otherText.length > 0

  function selectOption(name: string) {
    if (name === 'Other') {
      onChange('Other')
      setQuery('Other')
    } else {
      onChange(name)
      setQuery(name)
      setOtherText('')
    }
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        required={required && value !== 'Other'}
        className={inputClass}
        placeholder="Search your university *"
        value={open ? query : value || query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 ? (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-line bg-white shadow-lg">
          {filtered.map((u) => (
            <button
              key={u.id}
              type="button"
              className="w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-canvas"
              onClick={() => selectOption(u.name)}
            >
              {u.name}
            </button>
          ))}
        </div>
      ) : null}
      {showOther ? (
        <input
          required={required}
          className={`${inputClass} mt-3`}
          placeholder="Enter your university name *"
          value={otherText}
          onChange={(e) => {
            setOtherText(e.target.value)
            onChange(e.target.value.trim() || 'Other')
          }}
        />
      ) : null}
    </div>
  )
}
