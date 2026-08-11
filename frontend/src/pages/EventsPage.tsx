import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EventListingCard } from '../components/Cards'
import { Footer } from '../components/Footer'
import { useAuth } from '../context/useAuth'
import { useLocale } from '../context/useLocale'
import { IMG } from '../data/mockData'
import type { ApiEvent, PaginatedResponse } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'
import { formatDate, formatTime } from '../utils/format'

export default function EventsPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await apiRequest<PaginatedResponse<ApiEvent>>('/api/events')
        setEvents(response.data)
        setError(null)
      } catch (requestError) {
        setError(
          requestError instanceof ApiError ? requestError.message : 'Could not load hiking events.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadEvents()
  }, [])

  const createPath =
    user?.role === 'organizer'
      ? '/organizer/events/new'
      : user?.role === 'explorer'
        ? '/organizer/apply'
        : '/login'
  const createLabel =
    user?.role === 'organizer'
      ? t('events.create')
      : user?.role === 'explorer'
        ? t('events.apply')
        : t('nav.signIn')
  const leadPath =
    user?.role === 'organizer'
      ? '/organizer-dashboard'
      : user?.role === 'explorer'
        ? '/organizer/apply'
        : '/login'
  const leadLabel =
    user?.role === 'organizer'
      ? 'Open organizer dashboard'
      : user?.role === 'explorer'
        ? 'Apply to organize'
        : 'Sign in to organize'

  const featured = events.find((event) => event.status === 'featured') ?? events[0] ?? null
  const rest = featured ? events.filter((event) => event.id !== featured.id) : events

  return (
    <main>
      <section className="events-page">
        <div className="events-head">
          <div className="stacked-heading small">
            <span>Mandalay Trek</span>
            <strong>{t('events.seasonal')}</strong>
            <p>{t('events.description')}</p>
          </div>
          {user?.role !== 'admin' && (
            <Link className="button cta" to={createPath}>
              <span className="material-symbols-outlined">add</span>
              {createLabel}
            </Link>
          )}
        </div>
        <div className="events-grid">
          {isLoading && <p className="table-empty">Loading hiking events...</p>}
          {error && <p className="table-empty danger">{error}</p>}
          {!isLoading && !error && !events.length && (
            <p className="table-empty">No events have been scheduled yet.</p>
          )}
          {featured && (
            <Link className="featured-event" to={`/events/${featured.id}`}>
              <img src={featured.cover_image || IMG.eventHero} alt={featured.title} />
              <div>
                <span className="badge dark-badge">{featured.status}</span>
                <span className="badge pale">
                  {featured.participants_count ?? 0} / {featured.participant_limit} joined
                </span>
                <p className="mono">
                  {formatDate(featured.starts_at)} - {formatTime(featured.starts_at)}
                </p>
                <h2>{featured.title}</h2>
                <p>{featured.description || featured.destination}</p>
              </div>
            </Link>
          )}
          {rest.map((event) => (
            <EventListingCard key={event.id} event={event} />
          ))}
          <article className="lead-card">
            <span className="material-symbols-outlined">group_add</span>
            <h3>{t('events.lead')}</h3>
            <p>{t('events.leadCopy')}</p>
            {user?.role !== 'admin' && <Link to={leadPath}>{leadLabel}</Link>}
          </article>
        </div>
        <section className="safety-band">
          <div>
            <p className="hero-light">{t('events.safety')}</p>
            <h2>{t('events.base')}</h2>
            <p>{t('events.safetyCopy')}</p>
            <button className="button cta" type="button">
              {t('events.guidelines')}
            </button>
          </div>
          <div className="contour-lines" aria-hidden="true" />
        </section>
      </section>
      <Footer />
    </main>
  )
}
