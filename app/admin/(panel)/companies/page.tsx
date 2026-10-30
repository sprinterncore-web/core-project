'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Building2, CheckCircle2, Inbox, Plus, Shield } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { CompanyTable } from '@/components/admin/companies/CompanyTable'
import { CompanyWaitlistTable } from '@/components/admin/companies/CompanyWaitlistTable'
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
import {
  getCompanyWaitlist,
  updateWaitlistStatus,
} from '@/lib/supabase/waitlist'
import type { Company, CompanyWaitlist, WaitlistStatus } from '@/types/database'

const PIPELINE_OPTIONS = [
  { label: 'All Companies', value: 'all' },
  { label: 'Waitlisted', value: 'waitlisted' },
  { label: 'Onboarded', value: 'onboarded' },
] as const

export default function AdminCompaniesPage() {
  const searchParams = useSearchParams()
  const [companies, setCompanies] = useState<Company[]>([])
  const [waitlistEntries, setWaitlistEntries] = useState<CompanyWaitlist[]>([])
  const [search, setSearch] = useState('')
  const [pipelineFilter, setPipelineFilter] = useState<string>('all')
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    companyId: string | null
    companyName: string
  }>({ open: false, companyId: null, companyName: '' })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    const s = searchParams.get('status')
    if (s === 'waitlisted') setPipelineFilter('waitlisted')
  }, [searchParams])

  const refresh = useCallback(() => {
    getAllCompanies(showDeleted).then(setCompanies)
    getCompanyWaitlist().then(setWaitlistEntries)
  }, [showDeleted])

  useEffect(() => {
    refresh()
  }, [refresh])

  const waitlistOnly = useMemo(
    () =>
      waitlistEntries.filter(
        (e) => e.status === 'waitlist' || e.status === 'contacted'
      ),
    [waitlistEntries]
  )

  const stats = useMemo(() => {
    const active = companies.filter((c) => !c.deleted)
    return {
      totalOnboarded: active.length,
      waitlistSubmissions: waitlistOnly.length,
      activeCompanies: active.filter((c) => c.status === 'active').length,
      platformAccess: active.filter((c) => c.platform_access).length,
    }
  }, [companies, waitlistOnly.length])

  async function toggleAccess(id: string, access: boolean) {
    await updateCompany(id, {
      platform_access: access,
      access_granted_at: access ? new Date().toISOString() : null,
    })
    refresh()
  }

  async function changeWaitlistStatus(id: string, status: WaitlistStatus) {
    const { error } = await updateWaitlistStatus(id, status)
    if (error) showToast(error, 'error')
    else {
      showToast('Waitlist status updated', 'success')
      refresh()
    }
  }

  const showWaitlist =
    pipelineFilter === 'all' || pipelineFilter === 'waitlisted'
  const showOnboarded =
    pipelineFilter === 'all' || pipelineFilter === 'onboarded'

  return (
    <AdminShell title="Companies">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Onboarded"
          value={stats.totalOnboarded}
          icon={Building2}
          iconColor="text-blue"
        />
        <StatCard
          label="Waitlist Submissions"
          value={stats.waitlistSubmissions}
          icon={Inbox}
          iconColor="text-amber-500"
        />
        <StatCard
          label="Active Companies"
          value={stats.activeCompanies}
          icon={CheckCircle2}
          iconColor="text-teal"
        />
        <StatCard
          label="Platform Access"
          value={stats.platformAccess}
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
          <select
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
            value={pipelineFilter}
            onChange={(e) => setPipelineFilter(e.target.value)}
          >
            {PIPELINE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
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

      {showWaitlist ? (
        <div className={showOnboarded ? 'mb-10' : ''}>
          <CompanyWaitlistTable
            entries={
              pipelineFilter === 'waitlisted' ? waitlistOnly : waitlistEntries
            }
            search={search}
            onStatusChange={changeWaitlistStatus}
          />
        </div>
      ) : null}

      {showOnboarded ? (
        <div>
          {pipelineFilter === 'all' ? (
            <p className="mb-3 text-sm font-semibold text-navy">
              Onboarded companies
            </p>
          ) : null}
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
        </div>
      ) : null}

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
        description="This soft-deletes the company and related portal data."
        isLoading={deleteLoading}
      />

      <Toast {...toast} onHide={hideToast} />
    </AdminShell>
  )
}
