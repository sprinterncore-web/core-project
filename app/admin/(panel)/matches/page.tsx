'use client'

import { AdminShell } from '@/components/admin/AdminShell'
import { Sparkles } from 'lucide-react'

export default function AdminMatchesPage() {
  return (
    <AdminShell title="Match Results">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white py-24 text-center">
        <Sparkles size={48} className="text-teal" />
        <h2 className="mt-4 text-xl font-bold text-navy">Coming soon</h2>
        <p className="mt-2 max-w-md text-sm text-slate">
          Groq matching is active — trigger runs from student profiles or job
          detail pages. Aggregate match analytics will live here.
        </p>
      </div>
    </AdminShell>
  )
}
