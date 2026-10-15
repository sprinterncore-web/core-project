import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  trend?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  trend,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-navy">{value}</p>
          <p className="mt-1 text-sm text-slate">{label}</p>
          {trend ? (
            <p className="mt-1 text-xs text-slate/60">{trend}</p>
          ) : null}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-canvas ${iconColor}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}
