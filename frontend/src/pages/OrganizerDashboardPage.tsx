import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CalendarDate from 'reicon-react/icons/CalendarDate'
import RouteTrack from 'reicon-react/icons/RouteTrack'
import ShieldCheck from 'reicon-react/icons/ShieldCheck'
import Users from 'reicon-react/icons/Users'
import { Metric, OrganizerRow, PortalShell, UserCard } from '../components/Portal'
import { ProfileHeader } from '../components/ProfileHeader'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import type {
  ApiEvent,
  ApiEventParticipant,
  AttendanceStatus,
  PaginatedResponse,
  ProfilePayload,
} from '../types/api'
import { ApiError, apiRequest } from '../utils/api'
import { formatDate } from '../utils/format'

const ATTENDANCE_OPTIONS: AttendanceStatus[] = ['joined', 'attended', 'missed']

export default function OrganizerDashboardPage() {
  const { authToken, user } = useAuth()
  const { showToast } = useToast()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [profile, setProfile] = useState<ProfilePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(authToken))
  const [managed, setManaged] = useState<ApiEvent | null>(null)
  const [participants, setParticipants] = useState<ApiEventParticipant[]>([])
  const [isPanelLoading, setIsPanelLoading] = useState(false)

  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!authToken) return

    const loadEvents = async () => {
      try {
        const [eventsResponse, profileResponse] = await Promise.all([
          apiRequest<PaginatedResponse<ApiEvent>>('/api/events?mine=1', { token: authToken }),
          apiRequest<ProfilePayload>(`/api/profiles/${user?.id}`, { token: authToken }),
        ])
        setEvents(eventsResponse.data)
        setProfile(profileResponse)
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
  }, [authToken, reloadToken, user?.id])

  const openParticipants = async (event: ApiEvent) => {
    setManaged(event)
    setIsPanelLoading(true)

    try {
      const response = await apiRequest<ApiEventParticipant[]>(
        `/api/events/${event.id}/participants`,
        { token: authToken },
      )
      setParticipants(response)
    } catch (requestError) {
      setParticipants([])
      showToast({
        message:
          requestError instanceof ApiError
            ? requestError.message
            : 'Could not load the participant list.',
        title: 'Participants unavailable',
        variant: 'error',
      })
    } finally {
      setIsPanelLoading(false)
    }
  }

  const setAttendance = async (participantId: number, status: AttendanceStatus) => {
    if (!managed) return

    try {
      await apiRequest(`/api/events/${managed.id}/attendance`, {
        body: JSON.stringify({ user_id: participantId, attendance_status: status }),
        method: 'PUT',
        token: authToken,
      })
      setParticipants((current) =>
        current.map((participant) =>
          participant.id === participantId
            ? { ...participant, pivot: { attendance_status: status } }
            : participant,
        ),
      )
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError
            ? requestError.message
            : 'Could not save this attendance change.',
        title: 'Attendance not saved',
        variant: 'error',
      })
    }
  }

  const cancelEvent = async (event: ApiEvent) => {
    if (!window.confirm(`Cancel "${event.title}"? Participants keep their place in the record.`)) {
      return
    }

    try {
      await apiRequest<ApiEvent>(`/api/events/${event.id}`, {
        method: 'DELETE',
        token: authToken,
      })
      showToast({
        message: `${event.title} is now marked as cancelled.`,
        title: 'Event cancelled',
        variant: 'success',
      })
      setManaged(null)
      setReloadToken((current) => current + 1)
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError ? requestError.message : 'Could not cancel this event.',
        title: 'Event not cancelled',
        variant: 'error',
      })
    }
  }

  const rows = useMemo(
    () =>
      events.map((event) => ({
        event,
        row: [
          event.title,
          formatDate(event.starts_at),
          event.status,
          `${event.participants_count ?? 0} / ${event.participant_limit}`,
          event.cover_image || '',
        ],
      })),
    [events],
  )
  const totalParticipants = events.reduce((sum, event) => sum + (event.participants_count ?? 0), 0)
  const upcomingEvents = events.filter((event) => event.status === 'upcoming')

  return (
    <PortalShell active="organizer">
      {profile && (
        <ProfileHeader
          badge={
            <span className="badge dark-badge">
              <ShieldCheck size={16} weight="Filled" />
              Verified organizer
            </span>
          }
          isOwner
          onProfileSaved={setProfile}
          profile={profile}
          stats={[
            {
              icon: <CalendarDate size={22} weight="Filled" />,
              label: 'Hosted events',
              value: String(events.length),
            },
            {
              icon: <Users size={22} weight="Filled" />,
              label: 'Participants',
              value: String(totalParticipants),
            },
            {
              icon: <RouteTrack size={22} weight="Filled" />,
              label: 'Role',
              value: profile.user.role,
            },
          ]}
        />
      )}
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
          rows.map(({ event, row }) => (
            <OrganizerRow
              key={event.id}
              onCancel={() => void cancelEvent(event)}
              onManage={() => void openParticipants(event)}
              row={row}
            />
          ))
        ) : (
          <p className="table-empty">No events created for this organizer account yet.</p>
        )}
      </div>
      {managed && (
        <section className="portal-section">
          <div className="portal-section-head">
            <h2>
              Participants <span>{managed.title}</span>
            </h2>
            <button type="button" onClick={() => setManaged(null)}>
              Close
            </button>
          </div>
          {isPanelLoading ? (
            <p className="table-empty">Loading participants...</p>
          ) : participants.length ? (
            <div className="data-table">
              {participants.map((participant) => (
                <div className="participant-row" key={participant.id}>
                  <span>
                    <strong>{participant.name}</strong>
                  </span>
                  <span>{participant.email}</span>
                  <span className="organizer-row-actions">
                    {ATTENDANCE_OPTIONS.map((option) => (
                      <button
                        className={
                          participant.pivot?.attendance_status === option ? 'active' : undefined
                        }
                        key={option}
                        type="button"
                        onClick={() => void setAttendance(participant.id, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="table-empty">Nobody has joined this event yet.</p>
          )}
        </section>
      )}
      <div className="portal-stats three">
        <Metric title="My Events" value={String(events.length)} icon="event_note" />
        <Metric title="Joined Hikers" value={String(totalParticipants)} icon="groups" />
        <Metric title="Upcoming" value={String(upcomingEvents.length)} icon="route" accent />
      </div>
    </PortalShell>
  )
}
