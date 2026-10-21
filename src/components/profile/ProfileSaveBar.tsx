'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, PenLine } from 'lucide-react'

type Props = {
  isDirty: boolean
  isSaving: boolean
  onSave: () => void
  onDiscard: () => void
}

export function ProfileSaveBar({
  isDirty,
  isSaving,
  onSave,
  onDiscard,
}: Props) {
  return (
    <AnimatePresence>
      {isDirty ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-white px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
        >
          <div className="mx-auto flex max-w-[1280px] items-center justify-between">
            <div className="flex items-center">
              <PenLine size={16} className="text-teal" />
              <span className="ml-2 text-sm font-semibold text-navy">
                You have unsaved changes
              </span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onDiscard}
                className="text-sm text-slate hover:text-navy"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={onSave}
                className="flex items-center gap-2 rounded-full bg-teal px-7 py-2.5 text-sm font-bold text-white hover:bg-teal-dark disabled:opacity-70"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                Save Profile
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
