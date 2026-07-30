import { useContext } from 'react'
import { BackendStatusContext } from './backendStatusCore'

export function useBackendStatus() {
  const context = useContext(BackendStatusContext)
  if (!context) throw new Error('useBackendStatus must be used within BackendStatusProvider')
  return context
}
