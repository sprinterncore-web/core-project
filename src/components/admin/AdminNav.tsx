'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AdminNav({ title }: { title: string }) {
  const [email, setEmail] = useState('')

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (user?.email) setEmail(user.email)
      })
  }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
      <h1 className="text-lg font-bold text-navy">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-slate sm:inline">{email}</span>
        <Bell size={18} className="text-slate" />
      </div>
    </header>
  )
}
