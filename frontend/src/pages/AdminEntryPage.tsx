import { useAuth } from '../context/useAuth'
import AdminDashboardPage from './AdminDashboardPage'
import AuthPage from './AuthPage'

export default function AdminEntryPage() {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <main className="route-loading">
        <span className="material-symbols-outlined">sync</span>
        <strong>Restoring session</strong>
      </main>
    )
  }

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
