import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Metric, OrganizerRow, PortalShell, UserCard } from '../components/Portal'
import { useAuth } from '../context/useAuth'
import { ApiError, apiRequest } from '../utils/api'

type OrganizerEvent = {
  cover_image?: string | null
  id: number
  participant_limit: number
  participants_count?: number
  starts_at: string
  status: string
  title: string
}

type PaginatedResponse<T> = {
  data: T[]
}

const formatEventDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))

export default function OrganizerDashboardPage() {
  const { authToken, user } = useAuth()
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(authToken))

  useEffect(() => {
    if (!authToken) return

    const loadEvents = async () => {
      try {
        const response = await apiRequest<PaginatedResponse<OrganizerEvent>>('/api/events?mine=1', {
          token: authToken,
        })
        setEvents(response.data)
        setError(null)
      } catch (requestError) {
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Could not load your organizer events.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadEvents()
  }, [authToken])

  const rows = useMemo(
    () =>
      events.map((event) => [
        event.title,
        formatEventDate(event.starts_at),
        event.status,
        `${event.participants_count ?? 0} / ${event.participant_limit}`,
        event.cover_image || '',
      ]),
    [events],
  )
  const totalParticipants = events.reduce((sum, event) => sum + (event.participants_count ?? 0), 0)
  const upcomingEvents = events.filter((event) => event.status === 'upcoming')

  return (
    <PortalShell active="organizer">
      <div className="portal-title-row">
        <div>
          <span className="label orange-text">Organizer Dashboard</span>
          <h1>{user?.name || 'Managed Events'}</h1>
        </div>
        <UserCard meta={user?.email || 'Organizer account'} name={user?.role || 'organizer'} />
        <Link className="button brown" to="/organizer/events/new">
          <span className="material-symbols-outlined">add_circle</span>Create New Event
        </Link>
      </div>
      <div className="data-table">
        <div className="table-head">
          <span>Event Name</span>
          <span>Date</span>
          <span>Status</span>
          <span>Participants</span>
          <span>Actions</span>
        </div>
        {isLoading ? (
          <p className="table-empty">Loading your events...</p>
        ) : error ? (
          <p className="table-empty danger">{error}</p>
        ) : rows.length ? (
          rows.map((row) => <OrganizerRow key={row[0]} row={row} />)
        ) : (
          <p className="table-empty">No events created for this organizer account yet.</p>
        )}
      </div>
      <div className="portal-stats three">
        <Metric title="My Events" value={String(events.length)} icon="event_note" />
        <Metric title="Joined Hikers" value={String(totalParticipants)} icon="groups" />
        <Metric title="Upcoming" value={String(upcomingEvents.length)} icon="route" accent />
      </div>
    </PortalShell>
  )
}
