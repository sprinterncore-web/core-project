import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  const inputId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-navy">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy placeholder:text-slate/50 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20 ${className}`}
        {...props}
      />
    </div>
  )
}
