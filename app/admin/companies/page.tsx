'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Building2, CheckCircle2, Clock, Plus, Shield } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { CompanyTable } from '@/components/admin/companies/CompanyTable'
import { StatCard } from '@/components/ui/StatCard'
import { getAllCompanies, updateCompany } from '@/lib/supabase/admin'
import type { Company } from '@/types/database'

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllCompanies().then(setCompanies)
  }, [])

  const stats = useMemo(
    () => ({
      total: companies.length,
      active: companies.filter((c) => c.status === 'active').length,
      pendingCall: companies.filter((c) => !c.call_booked).length,
      access: companies.filter((c) => c.platform_access).length,
    }),
    [companies]
  )

  async function toggleAccess(id: string, access: boolean) {
    await updateCompany(id, {
      platform_access: access,
      access_granted_at: access ? new Date().toISOString() : null,
    })
    setCompanies(await getAllCompanies())
  }

  return (
    <AdminShell title="Companies">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Companies"
          value={stats.total}
          icon={Building2}
          iconColor="text-blue"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={CheckCircle2}
          iconColor="text-teal"
        />
        <StatCard
          label="Pending Call"
          value={stats.pendingCall}
          icon={Clock}
          iconColor="text-amber-500"
        />
        <StatCard
          label="Platform Access"
          value={stats.access}
          icon={Shield}
          iconColor="text-teal"
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <input
          className="w-72 rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link
          href="/admin/companies/new"
          className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          <Plus size={16} />
          Add Company
        </Link>
      </div>

      <CompanyTable
        companies={companies}
        search={search}
        onToggleAccess={toggleAccess}
      />
    </AdminShell>
  )
}
