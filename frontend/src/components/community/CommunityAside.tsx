import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocale } from '../../context/useLocale'
import type { ApiEvent, ApiTrail, PaginatedResponse } from '../../types/api'
import { formatDate, formatDistance } from '../../utils/format'
import { apiRequest } from '../../utils/api'

const PANEL_COUNT = 4
const EVENT_COUNT = 3

function TrailRow({ trail, meta }: { meta: string; trail: ApiTrail }) {
  return (
    <Link className="aside-row" to={`/trails/${trail.id}`}>
      {trail.cover_image ? (
        <img alt={trail.name} src={trail.cover_image} />
      ) : (
        <span className="aside-thumb-placeholder" />
      )}
      <span className="aside-row-text">
        <strong>{trail.name}</strong>
        <small>{meta}</small>
      </span>
    </Link>
  )
}

export function CommunityAside() {
  const { t } = useLocale()
  const [newest, setNewest] = useState<ApiTrail[]>([])
  const [popular, setPopular] = useState<ApiTrail[]>([])
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSidebar = async () => {
      try {
        const [newestResponse, popularResponse, eventsResponse] = await Promise.all([
          apiRequest<PaginatedResponse<ApiTrail>>('/api/trails'),
          apiRequest<PaginatedResponse<ApiTrail>>('/api/trails?sort=popular'),
          apiRequest<PaginatedResponse<ApiEvent>>('/api/events?status=upcoming'),
        ])
        setNewest(newestResponse.data.slice(0, PANEL_COUNT))
        setPopular(popularResponse.data.slice(0, PANEL_COUNT))
        setEvents(eventsResponse.data.slice(0, EVENT_COUNT))
      } catch {
        // The sidebar is supplementary: leave the panels empty rather than
        // pushing an error over the feed, which loads independently.
      } finally {
        setIsLoading(false)
      }
    }

    void loadSidebar()
  }, [])

  if (isLoading) {
    return (
      <aside className="community-aside">
        <p className="table-empty">{t('community.loading')}</p>
      </aside>
    )
  }

  return (
    <aside className="community-aside">
      {popular.length > 0 && (
        <section className="aside-panel">
          <h2>{t('community.mostHiked')}</h2>
          {popular.map((trail) => (
            <TrailRow
              key={trail.id}
              meta={`${trail.favorites_count ?? 0} ${t('community.saves')} · ${
                trail.ratings_count ?? 0
              } ${t('community.reviews')}`}
              trail={trail}
            />
          ))}
          <Link className="aside-more" to="/trails">
            {t('community.browseTrails')}
          </Link>
        </section>
      )}

      {newest.length > 0 && (
        <section className="aside-panel">
          <h2>{t('community.newestTrails')}</h2>
          {newest.map((trail) => (
            <TrailRow
              key={trail.id}
              meta={`${trail.difficulty} · ${formatDistance(trail.distance_km)}`}
              trail={trail}
            />
          ))}
        </section>
      )}

      {events.length > 0 && (
        <section className="aside-panel">
          <h2>{t('community.upcomingHikes')}</h2>
          {events.map((event) => (
            <Link className="aside-row compact" key={event.id} to={`/events/${event.id}`}>
              <span className="aside-row-text">
                <strong>{event.title}</strong>
                <small>
                  {formatDate(event.starts_at)} · {event.participants_count ?? 0}/
                  {event.participant_limit} {t('community.joined')}
                </small>
              </span>
            </Link>
          ))}
          <Link className="aside-more" to="/events">
            {t('community.browseEvents')}
          </Link>
        </section>
      )}
    </aside>
  )
}
