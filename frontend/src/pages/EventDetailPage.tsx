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
import { eventStatusTone, formatDate, formatDistance, formatTime } from '../utils/format'
import { bgStyle } from '../utils/style'

const toList = (value?: string | null) =>
  (value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)

const STATUS_KEYS = {
  cancelled: 'event.cancelled',
  completed: 'event.completed',
  featured: 'event.featured',
  upcoming: 'event.upcoming',
} as const

const statusKey = (status: string) =>
  STATUS_KEYS[status as keyof typeof STATUS_KEYS] ?? STATUS_KEYS.upcoming

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
  const filledRatio = event.participant_limit
    ? Math.min(joinedCount / event.participant_limit, 1)
    : 0
  const equipment = toList(event.required_equipment)
  const trail = event.trail
  const organizerPath = event.organizer ? `/organizers/${event.organizer.id}` : null

  return (
    <main>
      <section
        className="event-detail-hero photo-hero"
        style={bgStyle(event.cover_image || IMG.eventHero)}
      >
        <div className="event-hero-tags">
          <span className={`badge ${eventStatusTone(event.status)}`}>
            {t(statusKey(event.status))}
          </span>
          {trail && (
            <span className={`badge ${trail.difficulty.toLowerCase()}`}>{trail.difficulty}</span>
          )}
          {isFull && !isClosed && <span className="badge full">Full</span>}
        </div>
        <p className="hero-light">{event.destination}</p>
        <h1>{event.title}</h1>
        <p className="event-hero-meta">
          <span>{formatDate(event.starts_at)}</span>
          <span>{formatTime(event.starts_at)}</span>
          <span>
            {joinedCount}/{event.participant_limit} hikers
          </span>
        </p>
      </section>
      <section className="event-detail-layout">
        <div className="event-main">
          <h2 className="section-title">{t('event.overview')}</h2>
          <p className="detail-copy">{event.description}</p>

          <article className="event-block">
            <div className="event-block-head">
              <h3>{t('event.trail')}</h3>
              {trail && (
                <Link className="button outline" to={`/trails/${trail.id}`}>
                  {t('event.viewTrail')}
                </Link>
              )}
            </div>
            {trail ? (
              <>
                <strong className="event-trail-name">{trail.name}</strong>
                <div className="event-facts">
                  <Stat label={t('detail.difficulty')} value={trail.difficulty} />
                  <Stat label={t('detail.distance')} value={formatDistance(trail.distance_km)} />
                  <Stat label={t('detail.elevation')} value={`${trail.elevation_m} m`} />
                  <Stat label={t('detail.duration')} value={trail.duration || '—'} />
                  <Stat label={t('detail.bestSeason')} value={trail.best_season || '—'} />
                </div>
              </>
            ) : (
              <p className="event-block-empty">{t('event.noTrail')}</p>
            )}
          </article>

          <article className="event-block">
            <div className="event-block-head">
              <h3>{t('event.equipment')}</h3>
            </div>
            <Panel items={equipment.length ? equipment : [t('event.noEquipment')]} />
          </article>

          <article className="event-block">
            <div className="event-block-head">
              <h3>{t('event.organizer')}</h3>
            </div>
            <div className="organizer-strip">
              <InitialAvatar name={event.organizer?.name || 'Organizer'} />
              {organizerPath ? (
                <Link to={organizerPath}>
                  <strong>{event.organizer?.name}</strong>
                  <span>View organizer profile</span>
                </Link>
              ) : (
                <span>
                  <strong>Unassigned</strong>
                  <span>No organizer on this trek</span>
                </span>
              )}
              {event.organizer?.is_verified && (
                <p>
                  <ShieldCheck size={20} weight="Filled" />
                  {t('profile.verified')}
                </p>
              )}
            </div>
          </article>
        </div>
        <aside className="join-panel">
          <span>{t('event.booking')}</span>
          <strong>{formatDate(event.starts_at)}</strong>
          <dl className="booking-facts">
            <div>
              <dt>{t('event.departure')}</dt>
              <dd>{formatTime(event.starts_at)}</dd>
            </div>
            <div>
              <dt>{t('event.meeting')}</dt>
              <dd>{event.meeting_point || 'To be announced'}</dd>
            </div>
            <div>
              <dt>{t('event.destination')}</dt>
              <dd>{event.destination}</dd>
            </div>
            <div>
              <dt>{t('event.groupSize')}</dt>
              <dd>{event.participant_limit} hikers max</dd>
            </div>
          </dl>
          <div className="booking-seats">
            <div className="seat-bar" aria-hidden="true">
              <span style={{ width: `${Math.round(filledRatio * 100)}%` }} />
            </div>
            <p>
              {joinedCount} of {event.participant_limit} places taken - {slotsLeft} remaining
            </p>
            {Boolean(event.participants?.length) && (
              <div className="avatar-row" aria-label={t('event.participants')}>
                {event.participants?.slice(0, 4).map((participant) => (
                  <InitialAvatar key={participant.id} name={participant.name} />
                ))}
                {joinedCount > 4 && <b>+{joinedCount - 4}</b>}
              </div>
            )}
          </div>
          <button
            className="button cta wide"
            disabled={isJoining || isClosed || (isFull && !event.is_joined)}
            type="button"
            onClick={toggleJoin}
          >
            {event.is_joined ? t('event.joined') : isFull ? 'Event full' : t('event.join')}
          </button>
          {isClosed && <p className="booking-note">This event no longer accepts new hikers.</p>}
        </aside>
      </section>
      <Footer />
    </main>
  )
}
