'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock, Users, Zap } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { StudentTable } from '@/components/admin/students/StudentTable'
import { StatCard } from '@/components/ui/StatCard'
import { getAllStudents } from '@/lib/supabase/admin'
import type { Profile } from '@/types/database'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')

  useEffect(() => {
    getAllStudents().then(setStudents)
  }, [])

  const stats = useMemo(() => {
    return {
      total: students.length,
      complete: students.filter((s) => s.onboarding_complete).length,
      pending: students.filter((s) => s.profile_status === 'pending').length,
      active: students.filter((s) => s.profile_status === 'active').length,
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
          value={stats.active}
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
      </div>

      <StudentTable
        students={students}
        searchQuery={search}
        statusFilter={statusFilter}
        roleFilter={roleFilter}
      />
    </AdminShell>
  )
}
