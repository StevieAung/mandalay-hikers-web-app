import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useToast } from './useToast'
import { BackendStatusContext } from './backendStatusCore'
import type { BackendStatus } from './backendStatusCore'
import { getApiBaseUrl } from '../utils/api'

const HEALTH_TIMEOUT_MS = 3000
const HEALTH_INTERVAL_MS = 25000

export function BackendStatusProvider({ children }: { children: ReactNode }) {
  const apiBaseUrl = getApiBaseUrl()
  const { showToast } = useToast()
  const previousStatus = useRef<BackendStatus>('checking')
  const [status, setStatus] = useState<BackendStatus>('checking')

  const checkBackend = useCallback(async (): Promise<BackendStatus> => {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS)

    try {
      const response = await fetch(`${apiBaseUrl}/up`, {
        cache: 'no-store',
        mode: 'no-cors',
        signal: controller.signal,
      })
      const nextStatus: BackendStatus =
        response.ok || response.type === 'opaque' ? 'online' : 'offline'
      setStatus(nextStatus)
      return nextStatus
    } catch {
      setStatus('offline')
      return 'offline'
    } finally {
      window.clearTimeout(timeoutId)
    }
  }, [apiBaseUrl])

  useEffect(() => {
    const initialCheckId = window.setTimeout(() => {
      void checkBackend()
    }, 0)
    const intervalId = window.setInterval(() => {
      void checkBackend()
    }, HEALTH_INTERVAL_MS)

    return () => {
      window.clearTimeout(initialCheckId)
      window.clearInterval(intervalId)
    }
  }, [checkBackend])

  useEffect(() => {
    if (previousStatus.current !== status) {
      if (status === 'offline') {
        showToast({
          message: 'Start Laravel and XAMPP MySQL, then try again.',
          title: 'Backend server is not reachable',
          variant: 'warning',
        })
      }

      if (previousStatus.current === 'offline' && status === 'online') {
        showToast({
          message: 'Laravel is reachable again. You can continue using connected features.',
          title: 'Backend connection restored',
          variant: 'success',
        })
      }

      previousStatus.current = status
    }
  }, [showToast, status])

  const value = useMemo(
    () => ({
      apiBaseUrl,
      checkBackend,
      isBackendAvailable: status === 'online',
      status,
    }),
    [apiBaseUrl, checkBackend, status],
  )

  return <BackendStatusContext.Provider value={value}>{children}</BackendStatusContext.Provider>
}
