'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Building2, CheckCircle2, Clock, Plus, Shield } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { CompanyTable } from '@/components/admin/companies/CompanyTable'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { StatCard } from '@/components/ui/StatCard'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import {
  getAllCompanies,
  restoreCompany,
  softDeleteCompany,
  updateCompany,
} from '@/lib/supabase/admin'
import type { Company } from '@/types/database'

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    companyId: string | null
    companyName: string
  }>({ open: false, companyId: null, companyName: '' })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const refresh = useCallback(() => {
    getAllCompanies(showDeleted).then(setCompanies)
  }, [showDeleted])

  useEffect(() => {
    refresh()
  }, [refresh])

  const stats = useMemo(() => {
    const active = companies.filter((c) => !c.deleted)
    return {
      total: active.length,
      active: active.filter((c) => c.status === 'active').length,
      pendingCall: active.filter((c) => !c.call_booked).length,
      access: active.filter((c) => c.platform_access).length,
    }
  }, [companies])

  async function toggleAccess(id: string, access: boolean) {
    await updateCompany(id, {
      platform_access: access,
      access_granted_at: access ? new Date().toISOString() : null,
    })
    refresh()
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
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="w-72 rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-slate">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            Show deleted accounts
          </label>
        </div>
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
        onDelete={(company) =>
          setDeleteModal({
            open: true,
            companyId: company.id,
            companyName: company.company_name,
          })
        }
        onRestore={async (id) => {
          await restoreCompany(id)
          showToast('Company restored', 'success')
          refresh()
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, companyId: null, companyName: '' })
        }
        onConfirm={async () => {
          if (!deleteModal.companyId) return
          setDeleteLoading(true)
          await softDeleteCompany(deleteModal.companyId)
          setDeleteModal({ open: false, companyId: null, companyName: '' })
          setDeleteLoading(false)
          showToast('Company deleted', 'success')
          refresh()
        }}
        title={`Delete ${deleteModal.companyName}?`}
        description="This will soft delete the company, all their job listings, and their portal access. All data is preserved."
        isLoading={deleteLoading}
      />

      <Toast {...toast} onHide={hideToast} />
    </AdminShell>
  )
}
