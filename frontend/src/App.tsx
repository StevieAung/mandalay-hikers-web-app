import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicLayout } from './components/PublicLayout'
import { AuthProvider } from './context/AuthContext'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminEntryPage from './pages/AdminEntryPage'
import AuthPage from './pages/AuthPage'
import CommunityPage from './pages/CommunityPage'
import CreateEventPage from './pages/CreateEventPage'
import EventDetailPage from './pages/EventDetailPage'
import EventsPage from './pages/EventsPage'
import ExplorerDashboardPage from './pages/ExplorerDashboardPage'
import ExplorerProfilePage from './pages/ExplorerProfilePage'
import HomePage from './pages/HomePage'
import OrganizerApplicationPage from './pages/OrganizerApplicationPage'
import OrganizerDashboardPage from './pages/OrganizerDashboardPage'
import OrganizerProfilePage from './pages/OrganizerProfilePage'
import TrailDetailPage from './pages/TrailDetailPage'
import TrailDiscoveryPage from './pages/TrailDiscoveryPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/trails" element={<TrailDiscoveryPage />} />
            <Route path="/trails/:id" element={<TrailDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profiles/:id" element={<ExplorerProfilePage />} />
            <Route path="/organizers/:id" element={<OrganizerProfilePage />} />
          </Route>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route
            path="/explorer-dashboard"
            element={
              <ProtectedRoute roles={['explorer']}>
                <ExplorerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/apply"
            element={
              <ProtectedRoute>
                <OrganizerApplicationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer-dashboard"
            element={
              <ProtectedRoute roles={['organizer']}>
                <OrganizerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <CreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminEntryPage />} />
          <Route path="/admin-login" element={<AdminEntryPage />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute roles={['admin']} loginPath="/admin-login">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/explorer-dashboard" replace />} />
          <Route path="/organizer" element={<Navigate to="/organizer-dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
