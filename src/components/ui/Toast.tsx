'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

type ToastProps = {
  message: string
  type: 'success' | 'error' | 'warning'
  visible: boolean
  onHide?: () => void
}

export function Toast({ message, type, visible, onHide }: ToastProps) {
  useEffect(() => {
    if (visible && onHide) {
      const t = setTimeout(onHide, 3000)
      return () => clearTimeout(t)
    }
  }, [visible, onHide])

  const Icon =
    type === 'success'
      ? CheckCircle2
      : type === 'warning'
        ? AlertTriangle
        : XCircle

  const iconClass =
    type === 'success'
      ? 'text-teal'
      : type === 'warning'
        ? 'text-amber-400'
        : 'text-red-400'

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 flex min-w-[260px] items-center gap-3 rounded-2xl bg-navy px-5 py-3.5 text-white shadow-xl"
        >
          <Icon className={iconClass} size={20} />
          <span className="text-sm font-medium">{message}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
