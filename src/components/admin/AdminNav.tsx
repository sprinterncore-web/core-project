'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAdminNotifications } from '@/lib/supabase/admin'

export function AdminNav({ title }: { title: string }) {
  const [email, setEmail] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (user?.email) setEmail(user.email)
      })
    getAdminNotifications().then((n) => setUnreadCount(n.length))
  }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
      <h1 className="text-lg font-bold text-navy">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-slate sm:inline">{email}</span>
        <div className="relative">
          <Bell size={18} className="text-slate" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  )
}
