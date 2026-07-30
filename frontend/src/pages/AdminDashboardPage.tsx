import { useEffect, useMemo, useState } from 'react'
import { Metric, PortalShell } from '../components/Portal'
import { useAuth } from '../context/useAuth'
import type { OrganizerApplication } from '../types'
import { ApiError, apiRequest } from '../utils/api'

type AdminDashboard = {
  pending_applications: number
  reports: number
  total_organizers: number
  total_users: number
  upcoming_events: number
}

type BackendOrganizerApplication = {
  id: number
  reason: string
  status: OrganizerApplication['status']
  user?: {
    email: string
    name: string
  }
}

type PaginatedResponse<T> = {
  data: T[]
}

export default function AdminDashboardPage() {
  const { authToken, user } = useAuth()
  const [applications, setApplications] = useState<OrganizerApplication[]>([])
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(authToken))

  useEffect(() => {
    if (!authToken) return

    const loadAdminData = async () => {
      try {
        const [dashboardResponse, applicationsResponse] = await Promise.all([
          apiRequest<AdminDashboard>('/api/admin/dashboard', { token: authToken }),
          apiRequest<PaginatedResponse<BackendOrganizerApplication>>(
            '/api/admin/organizer-applications',
            { token: authToken },
          ),
        ])
        setDashboard(dashboardResponse)
        setApplications(
          applicationsResponse.data.map((application) => ({
            id: String(application.id),
            name: application.user?.name || 'Unknown user',
            email: application.user?.email || 'No email',
            reason: application.reason,
            status: application.status,
          })),
        )
        setError(null)
      } catch (requestError) {
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Could not load admin dashboard data.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadAdminData()
  }, [authToken])

  const pendingCount = dashboard?.pending_applications ?? 0
  const rows = useMemo(() => applications, [applications])

  const reviewApplication = async (
    applicationId: string,
    status: OrganizerApplication['status'],
  ) => {
    if (!authToken || status === 'pending') return

    try {
      const response = await apiRequest<BackendOrganizerApplication>(
        `/api/admin/organizer-applications/${applicationId}`,
        {
          body: JSON.stringify({ status }),
          method: 'PATCH',
          token: authToken,
        },
      )
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, status: response.status }
            : application,
        ),
      )
      if (status === 'approved') {
        setDashboard((current) =>
          current
            ? {
                ...current,
                pending_applications: Math.max(0, current.pending_applications - 1),
                total_organizers: current.total_organizers + 1,
              }
            : current,
        )
      }
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Could not update organizer application.',
      )
    }
  }

  return (
    <PortalShell active="admin">
      <div className="portal-title-row">
        <div>
          <h1 className="command-title">
            {user?.name || 'Mandalay'} <strong>Command</strong>
          </h1>
          <p>Overseeing regional trail logistics and personnel operations.</p>
        </div>
        <div className="system-status">
          System Status <strong>Operational</strong>
          <span />
        </div>
      </div>
      <div className="portal-stats four">
        <Metric title="Active Users" value={String(dashboard?.total_users ?? 0)} />
        <Metric title="Pending Apps" value={String(pendingCount)} accent />
        <Metric title="Organizers" value={String(dashboard?.total_organizers ?? 0)} />
        <Metric title="Alerts" value={String(dashboard?.reports ?? 0)} danger />
      </div>
      <div className="admin-tabs">
        <button className="active">Organizer Applications</button>
        <button>User Registry</button>
        <button>Trail Inventory</button>
      </div>
      <div className="admin-table">
        <div className="admin-row head">
          <span>ID/Entity</span>
          <span>Email</span>
          <span>Status</span>
          <span>Reason</span>
          <span>Actions</span>
        </div>
        {isLoading && <p className="table-empty">Loading admin data...</p>}
        {error && <p className="table-empty danger">{error}</p>}
        {!isLoading && !error && !rows.length && (
          <p className="table-empty">No organizer applications found.</p>
        )}
        {rows.map((application) => (
          <div className="admin-row" key={application.id}>
            <span>
              <small>{application.id}</small>
              <strong>{application.name}</strong>
            </span>
            <span className="mono large">{application.email}</span>
            <span>
              <b
                className={application.status === 'approved' ? 'status approved' : 'status pending'}
              >
                {application.status}
              </b>
            </span>
            <span>
              <strong>{application.reason}</strong>
            </span>
            <span className="row-actions">
              <button
                type="button"
                disabled={application.status === 'approved'}
                onClick={() => void reviewApplication(application.id, 'approved')}
              >
                Approve
              </button>
              <button
                disabled={application.status === 'rejected'}
                onClick={() => void reviewApplication(application.id, 'rejected')}
                type="button"
              >
                Decline
              </button>
            </span>
          </div>
        ))}
      </div>
    </PortalShell>
  )
}
