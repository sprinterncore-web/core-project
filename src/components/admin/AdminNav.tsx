'use client'

import { useEffect, useRef, useState } from 'react'
import { Building2, Bell, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAdminNotifications } from '@/lib/supabase/admin'
import type { Notification } from '@/types/database'
import { formatDate } from '@/lib/format'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 48) return `${hrs}h ago`
  return formatDate(iso)
}

export function AdminNav({ title }: { title: string }) {
  const [email, setEmail] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (user?.email) setEmail(user.email)
      })
    getAdminNotifications().then(setNotifications)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unreadCount = notifications.length

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
      <h1 className="text-lg font-bold text-navy">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-slate sm:inline">{email}</span>
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="relative rounded-lg p-2 hover:bg-canvas"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-slate" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>
          {open ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-line bg-white py-2 shadow-lg">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate">
                  No new notifications
                </p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-3 border-b border-line px-4 py-3 last:border-0"
                  >
                    {n.type === 'new_student_waitlist' ? (
                      <GraduationCap size={16} className="mt-0.5 shrink-0 text-teal" />
                    ) : n.type === 'new_company_waitlist' ? (
                      <Building2 size={16} className="mt-0.5 shrink-0 text-blue" />
                    ) : (
                      <Bell size={16} className="mt-0.5 shrink-0 text-slate" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">{n.title}</p>
                      {n.body ? (
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate">{n.body}</p>
                      ) : null}
                      <p className="mt-1 text-[10px] text-slate/50">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
