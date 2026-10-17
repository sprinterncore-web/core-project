'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock, Users, Zap } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { StudentTable } from '@/components/admin/students/StudentTable'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { StatCard } from '@/components/ui/StatCard'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import {
  getAllStudents,
  restoreStudent,
  softDeleteStudent,
} from '@/lib/supabase/admin'
import type { Profile } from '@/types/database'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    studentId: string | null
    studentName: string
  }>({ open: false, studentId: null, studentName: '' })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const refresh = useCallback(() => {
    getAllStudents(showDeleted).then(setStudents)
  }, [showDeleted])

  useEffect(() => {
    refresh()
  }, [refresh])

  const stats = useMemo(() => {
    const active = students.filter((s) => !s.deleted)
    return {
      total: active.length,
      complete: active.filter((s) => s.onboarding_complete).length,
      pending: active.filter((s) => s.profile_status === 'pending').length,
      activeSprint: active.filter((s) => s.profile_status === 'active').length,
    }
  }, [students])

  return (
    <AdminShell title="Students">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={stats.total}
          icon={Users}
          iconColor="text-blue"
        />
        <StatCard
          label="Onboarding Complete"
          value={stats.complete}
          icon={CheckCircle2}
          iconColor="text-teal"
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon={Clock}
          iconColor="text-amber-500"
        />
        <StatCard
          label="Active Sprints"
          value={stats.activeSprint}
          icon={Zap}
          iconColor="text-teal"
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          className="w-72 rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-navy placeholder:text-slate/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/10"
          placeholder="Search by name, university, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {['All', 'Pending', 'Verified', 'Active'].map((o) => (
            <option key={o} value={o}>
              {o === 'All' ? 'All Status' : o}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          {['All', 'Developer', 'Designer', 'Growth', 'Data'].map((o) => (
            <option key={o} value={o}>
              {o === 'All' ? 'All Roles' : o}
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

      <StudentTable
        students={students}
        searchQuery={search}
        statusFilter={statusFilter}
        roleFilter={roleFilter}
        onDelete={(student) =>
          setDeleteModal({
            open: true,
            studentId: student.id,
            studentName: student.full_name ?? student.email,
          })
        }
        onRestore={async (id) => {
          await restoreStudent(id)
          showToast('Student restored', 'success')
          refresh()
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, studentId: null, studentName: '' })
        }
        onConfirm={async () => {
          if (!deleteModal.studentId) return
          setDeleteLoading(true)
          await softDeleteStudent(deleteModal.studentId)
          setDeleteModal({ open: false, studentId: null, studentName: '' })
          setDeleteLoading(false)
          showToast('Student deleted', 'success')
          refresh()
        }}
        title={`Delete ${deleteModal.studentName}?`}
        description="This will remove the student from the active pool and hide them from all views. Their data is preserved."
        isLoading={deleteLoading}
      />

      <Toast {...toast} onHide={hideToast} />
    </AdminShell>
  )
}
