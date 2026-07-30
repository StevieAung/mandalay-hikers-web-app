import { createContext } from 'react'

export type BackendStatus = 'checking' | 'online' | 'offline'

export type BackendStatusContextValue = {
  apiBaseUrl: string
  checkBackend: () => Promise<BackendStatus>
  isBackendAvailable: boolean
  status: BackendStatus
}

export const BackendStatusContext = createContext<BackendStatusContextValue | null>(null)
