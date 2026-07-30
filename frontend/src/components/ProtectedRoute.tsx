import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { UserRole } from '../types'
import { dashboardPathForRole } from '../utils/routes'

type ProtectedRouteProps = {
  children: ReactNode
  loginPath?: string
  roles?: UserRole[]
}

export function ProtectedRoute({ children, loginPath = '/login', roles }: ProtectedRouteProps) {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <main className="route-loading">
        <span className="material-symbols-outlined">sync</span>
        <strong>Restoring session</strong>
      </main>
    )
  }

  if (!user) return <Navigate to={loginPath} replace />
  if (roles && !roles.includes(user.role))
    return <Navigate to={dashboardPathForRole(user.role)} replace />

  return children
}
