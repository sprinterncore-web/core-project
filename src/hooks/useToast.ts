import { useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState<{
    visible: boolean
    message: string
    type: 'success' | 'error' | 'warning'
  }>({ visible: false, message: '', type: 'success' })

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' = 'success'
  ) => {
    setToast({ visible: true, message, type })
  }

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }))
  }

  return { toast, showToast, hideToast }
}
