import { createContext } from 'react'

export type ToastVariant = 'success' | 'warning' | 'error'

export type ToastMessage = {
  id: string
  message: string
  title: string
  variant: ToastVariant
}

export type ToastInput = {
  message: string
  title: string
  variant?: ToastVariant
}

export type ToastContextValue = {
  dismissToast: (id: string) => void
  showToast: (input: ToastInput) => void
  toasts: ToastMessage[]
}

export const ToastContext = createContext<ToastContextValue | null>(null)
