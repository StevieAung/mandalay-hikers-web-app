import { useAuth } from '../context/useAuth'
import AdminDashboardPage from './AdminDashboardPage'
import AuthPage from './AuthPage'

export default function AdminEntryPage() {
  const { user } = useAuth()

  if (user?.role === 'admin') return <AdminDashboardPage />

  return (
    <AuthPage
      mode="login"
      defaultEmail="admin@mandalayhikes.test"
      redirectTo="/admin"
      intent="admin"
    />
  )
}
