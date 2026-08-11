import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ShieldCheck from 'reicon-react/icons/ShieldCheck'
import { Panel, Stat } from '../components/Cards'
import { Footer } from '../components/Footer'
import { InitialAvatar } from '../components/Portal'
import { useAuth } from '../context/useAuth'
import { useLocale } from '../context/useLocale'
import { useToast } from '../context/useToast'
import { IMG } from '../data/mockData'
import type { ApiEvent } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'
import { formatDate, formatDistance, formatTime } from '../utils/format'
import { bgStyle } from '../utils/style'

const toList = (value?: string | null) =>
  (value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { authToken, user } = useAuth()
  const { t } = useLocale()
  const { showToast } = useToast()
  const [event, setEvent] = useState<ApiEvent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true)
      try {
        const response = await apiRequest<ApiEvent>(`/api/events/${id}`, { token: authToken })
        setEvent(response)
        setError(null)
      } catch (requestError) {
        setError(
          requestError instanceof ApiError ? requestError.message : 'Could not load this event.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadEvent()
  }, [authToken, id])

  const toggleJoin = async () => {
    if (!event) return

    if (!user) {
      navigate('/login')
      return
    }

    const leaving = Boolean(event.is_joined)
    setIsJoining(true)

    try {
      const response = await apiRequest<{ joined: boolean; participants_count: number }>(
        `/api/events/${event.id}/join`,
        { method: leaving ? 'DELETE' : 'POST', token: authToken },
      )
      setEvent({
        ...event,
        is_joined: response.joined,
        participants_count: response.participants_count,
      })
      showToast({
        message: leaving
          ? 'Your seat has been released for another hiker.'
          : 'The organizer can now see you on the participant list.',
        title: leaving ? 'You left this event' : 'You joined this event',
        variant: 'success',
      })
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError
            ? requestError.message
            : 'Could not update your booking.',
        title: 'Booking not updated',
        variant: 'error',
      })
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <main className="route-loading" role="status">
        <span className="material-symbols-outlined">progress_activity</span>
        Loading event...
      </main>
    )
  }

  if (error || !event) {
    return (
      <main>
        <section className="trail-detail-state">
          <span className="material-symbols-outlined">event_busy</span>
          <h1>Event unavailable</h1>
          <p>{error || 'This event could not be found.'}</p>
          <button className="button cta" type="button" onClick={() => navigate('/events')}>
            Back to events
          </button>
        </section>
        <Footer />
      </main>
    )
  }

  const joinedCount = event.participants_count ?? 0
  const slotsLeft = Math.max(event.participant_limit - joinedCount, 0)
  const isFull = slotsLeft === 0 && !event.is_joined
  const isClosed = event.status !== 'upcoming' && event.status !== 'featured'
  const equipment = toList(event.required_equipment)
  const trailFacts = event.trail
    ? [
        `Difficulty: ${event.trail.difficulty}`,
        `Distance: ${formatDistance(event.trail.distance_km)}`,
        `Elevation gain: ${event.trail.elevation_m} m`,
        event.trail.best_season ? `Best season: ${event.trail.best_season}` : null,
      ].filter((fact): fact is string => Boolean(fact))
    : []
  const organizerPath = event.organizer ? `/organizers/${event.organizer.id}` : null

  return (
    <main>
      <section
        className="event-detail-hero photo-hero"
        style={bgStyle(event.cover_image || IMG.eventHero)}
      >
        <p className="hero-light">{t('event.featured')}</p>
        <h1>{event.title}</h1>
      </section>
      <section className="event-detail-layout">
        <div className="event-main">
          <div className="event-facts">
            <Stat label="Date" value={formatDate(event.starts_at)} />
            <Stat label="Time" value={formatTime(event.starts_at)} />
            <Stat label="Difficulty" value={event.trail?.difficulty || 'Not set'} />
            <Stat label="Status" value={event.status} />
          </div>
          <div className="organizer-strip">
            <InitialAvatar name={event.organizer?.name || 'Organizer'} />
            {organizerPath ? (
              <Link to={organizerPath}>
                <span>Organizer</span>
                <strong>{event.organizer?.name}</strong>
              </Link>
            ) : (
              <span>
                <span>Organizer</span>
                <strong>Unassigned</strong>
              </span>
            )}
            <p>
              <ShieldCheck size={20} weight="Filled" />
              Verified Organizer
            </p>
          </div>
          <h2 className="section-title">{t('event.overview')}</h2>
          <p className="detail-copy">{event.description}</p>
          <div className="requirement-grid">
            <Panel
              title={t('event.equipment')}
              items={equipment.length ? equipment : ['No equipment list provided.']}
            />
            {Boolean(trailFacts.length) && (
              <Panel title={event.trail?.name || t('event.safetyRequirements')} items={trailFacts} />
            )}
          </div>
          {event.trail && (
            <div className="meeting-map">
              <Link className="button outline" to={`/trails/${event.trail.id}`}>
                View {event.trail.name}
              </Link>
              <div>
                <span>{t('event.meeting')}</span>
                <strong>{event.meeting_point}</strong>
              </div>
            </div>
          )}
          {!event.trail && (
            <div className="meeting-map">
              <div>
                <span>{t('event.meeting')}</span>
                <strong>{event.meeting_point}</strong>
              </div>
            </div>
          )}
        </div>
        <aside className="join-panel">
          <span>Destination</span>
          <strong>{event.destination}</strong>
          <button
            className="button cta wide"
            disabled={isJoining || isClosed || (isFull && !event.is_joined)}
            type="button"
            onClick={toggleJoin}
          >
            {event.is_joined ? t('event.joined') : isFull ? 'Event full' : t('event.join')}
          </button>
          {isClosed && <p>This event is {event.status} and no longer accepts new hikers.</p>}
          <p>
            {joinedCount} of {event.participant_limit} places taken. {slotsLeft} remaining.
          </p>
          {Boolean(event.participants?.length) && (
            <div className="avatar-row">
              {event.participants?.slice(0, 3).map((participant) => (
                <InitialAvatar key={participant.id} name={participant.name} />
              ))}
              {joinedCount > 3 && <b>+{joinedCount - 3}</b>}
            </div>
          )}
        </aside>
      </section>
      <Footer />
    </main>
  )
}
