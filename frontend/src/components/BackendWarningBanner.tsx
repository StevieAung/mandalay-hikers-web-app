import { useBackendStatus } from '../context/useBackendStatus'

export function BackendWarningBanner() {
  const { apiBaseUrl, status } = useBackendStatus()

  if (status !== 'offline') return null

  return (
    <div className="backend-warning" role="status">
      <span className="material-symbols-outlined">cloud_off</span>
      <p>
        <strong>Backend server is not reachable.</strong> Start Laravel and XAMPP MySQL, then try
        again.
      </p>
      <small>{apiBaseUrl}/up</small>
    </div>
  )
}
