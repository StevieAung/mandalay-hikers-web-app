import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { InitialAvatar, Metric, OrganizerRow, PortalShell } from '../components/Portal'
import { TrekCalendar } from '../components/TrekCalendar'
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
import { formatDate, toDayKey } from '../utils/format'

const ATTENDANCE_OPTIONS: AttendanceStatus[] = ['joined', 'attended', 'missed']

const attendanceOption = (status: AttendanceStatus) =>
  ({
    attended: { icon: 'check', label: 'Mark attended' },
    joined: { icon: 'schedule', label: 'Mark joined' },
    missed: { icon: 'close', label: 'Mark missed' },
  })[status]

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
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null)

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
    setSelectedCalendarDay(toDayKey(event.starts_at))
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
      // Approving/rejecting changes the event's seat and pending counts shown in the table.
      setReloadToken((current) => current + 1)
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
      events.map((event) => {
        const pending = event.pending_participants_count ?? 0
        const capacity = `${event.participants_count ?? 0} / ${event.participant_limit}`

        return {
          event,
          row: [
            event.title,
            formatDate(event.starts_at),
            event.status,
            pending ? `${capacity} · ${pending} pending` : capacity,
            event.cover_image || '',
          ],
        }
      }),
    [events],
  )
  const totalParticipants = events.reduce((sum, event) => sum + (event.participants_count ?? 0), 0)
  const upcomingEvents = events.filter((event) => event.status === 'upcoming')

  return (
    <PortalShell active="organizer">
      <div className="admin-compact-head">
        <div>
          <h1>Overview</h1>
        </div>
        <div className="system-status compact">
          Organizer <strong>Verified</strong>
          <span />
        </div>
      </div>
      <section className="organizer-account-card">
        {profile?.user.profile?.avatar ? (
          <img
            className="dashboard-profile-avatar"
            src={profile.user.profile.avatar}
            alt={profile.user.name}
          />
        ) : (
          <InitialAvatar name={profile?.user.name || user?.name || 'Organizer'} />
        )}
        <div>
          <span className="label orange-text">Organizer account</span>
          <h2>{profile?.user.name || user?.name || 'Mandalay Organizer'}</h2>
          <p>{profile?.user.profile?.bio || 'Create and manage safe local hiking events.'}</p>
        </div>
        <Link className="button outline" to={`/organizers/${profile?.user.id || user?.id}`}>
          View profile
        </Link>
      </section>
      <div className="portal-stats three admin-kpis organizer-kpis">
        <Metric title="My events" value={String(events.length)} icon="event_note" />
        <Metric title="Joined hikers" value={String(totalParticipants)} icon="groups" />
        <Metric title="Upcoming" value={String(upcomingEvents.length)} icon="route" accent />
      </div>
      <section className="admin-table-card organizer-events-card">
        <div className="admin-panel-head organizer-table-head">
          <h2>My events</h2>
          <Link className="button cta" to="/organizer/events/new">
            <span className="material-symbols-outlined">add_circle</span>Create event
          </Link>
        </div>
        <div className="data-table organizer-data-table">
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
      </section>
      {managed && (
        <div className="organizer-participants-layout">
          <aside className="organizer-event-calendar" aria-label="Event calendar">
            <TrekCalendar
              events={events}
              markedDaysLabel="Marked days have an event you host."
              onSelectDay={(day) => {
                setSelectedCalendarDay(day)
                const event = day ? events.find((item) => toDayKey(item.starts_at) === day) : undefined
                if (event && event.id !== managed.id) void openParticipants(event)
              }}
              selectedDay={selectedCalendarDay}
            />
          </aside>
          <section className="admin-table-card organizer-participants-card">
          <div className="admin-panel-head organizer-table-head">
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
              {participants.map((participant) => {
                const status = participant.pivot?.attendance_status
                const needsDecision = status === 'pending' || status === 'rejected'

                return (
                  <div className="participant-row" key={participant.id}>
                    <span>
                      <strong>{participant.name}</strong>
                    </span>
                    <span>{participant.email}</span>
                    <span className="organizer-row-actions">
                      {status && <b className={`status ${status}`}>{status}</b>}
                      {needsDecision ? (
                        <>
                          <button
                            className="approval-action approve"
                            type="button"
                            onClick={() => void setAttendance(participant.id, 'joined')}
                            aria-label={`Approve ${participant.name}`}
                            title="Approve"
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">
                              check
                            </span>
                          </button>
                          <button
                            className="approval-action reject"
                            type="button"
                            onClick={() => void setAttendance(participant.id, 'rejected')}
                            aria-label={`Reject ${participant.name}`}
                            title="Reject"
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">
                              close
                            </span>
                          </button>
                        </>
                      ) : (
                        ATTENDANCE_OPTIONS.map((option) => (
                          <button
                            className={`attendance-action ${option}${
                              status === option ? ' active' : ''
                            }`}
                            key={option}
                            type="button"
                            onClick={() => void setAttendance(participant.id, option)}
                            aria-label={`${attendanceOption(option).label} for ${participant.name}`}
                            title={attendanceOption(option).label}
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">
                              {attendanceOption(option).icon}
                            </span>
                          </button>
                        ))
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="table-empty">Nobody has requested to join this event yet.</p>
          )}
          </section>
        </div>
      )}
    </PortalShell>
  )
}
