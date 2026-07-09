import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import AuthPage from './AuthPage'

export default function AdminEntryPage() {
  const { user } = useAuth()

  if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />

  return (
    <AuthPage
      mode="login"
      defaultEmail="admin@mandalayhikes.test"
      redirectTo="/admin-dashboard"
      intent="admin"
    />
  )
}
