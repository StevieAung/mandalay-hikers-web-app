import { Link } from 'react-router-dom'
import { EventListingCard } from '../components/Cards'
import { Footer } from '../components/Footer'
import { useAuth } from '../context/useAuth'
import { useLocale } from '../context/useLocale'
import { useLocalizedContent } from '../data/useLocalizedContent'
import { formatEventDate } from '../utils/date'

export default function EventsPage() {
  const { user } = useAuth()
  const { locale, t } = useLocale()
  const { events } = useLocalizedContent()
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
          <Link className="featured-event" to="/events/yankin-dawn">
            <img src={events[0].image} alt={events[0].title} />
            <div>
              <span className="badge dark-badge">{events[0].status}</span>
              <span className="badge pale">Advanced</span>
              <p className="mono">{formatEventDate(events[0].date, events[0].time, locale)}</p>
              <h2>{events[0].title}</h2>
              <p>{events[0].text}</p>
            </div>
          </Link>
          {events.slice(1).map((event) => (
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
