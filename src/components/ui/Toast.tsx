'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'

type ToastProps = {
  message: string
  type: 'success' | 'error'
  visible: boolean
}

export function Toast({ message, type, visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-navy px-5 py-3 text-white shadow-lg"
        >
          {type === 'success' ? (
            <CheckCircle2 className="text-teal" size={20} />
          ) : (
            <XCircle className="text-red-400" size={20} />
          )}
          <span className="text-sm">{message}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
