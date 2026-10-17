'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Trash2 } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  description: string
  isLoading: boolean
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h2 className="text-center text-xl font-bold text-navy">{title}</h2>
            <p className="mt-2 text-center text-sm leading-relaxed text-slate">
              {description}
            </p>
            <p className="mt-3 text-center text-xs italic text-slate/50">
              This action can be undone — the record is soft deleted and can be
              restored from the admin panel.
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-line py-3 text-sm font-semibold text-navy transition-all hover:border-navy"
              >
                Cancel
              </button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={isLoading}
                onClick={() => onConfirm()}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                Delete
              </motion.button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
