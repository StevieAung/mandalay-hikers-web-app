import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContext } from './toastCore'
import type { ToastInput, ToastMessage } from './toastCore'

const TOAST_DURATION = 4800

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ message, title, variant = 'warning' }: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const toast = { id, message, title, variant }
      setToasts((current) => [toast, ...current].slice(0, 4))
      window.setTimeout(() => dismissToast(id), TOAST_DURATION)
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({ dismissToast, showToast, toasts }),
    [dismissToast, showToast, toasts],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
