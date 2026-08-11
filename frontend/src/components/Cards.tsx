import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ApiEvent, ApiPost, ApiTrail } from '../types/api'
import { IMG } from '../data/mockData'
import { bgStyle } from '../utils/style'
import { useLocale } from '../context/useLocale'
import { formatDate, formatDistance, formatTime } from '../utils/format'

export function OverlayTrail({ trail }: { trail: ApiTrail }) {
  return (
    <Link
      className="overlay-card"
      to={`/trails/${trail.id}`}
      style={bgStyle(trail.cover_image || IMG.trailA)}
    >
      <span>
        {trail.difficulty} - {formatDistance(trail.distance_km)}
      </span>
      <h3>{trail.name}</h3>
      <p>{trail.description}</p>
    </Link>
  )
}

export function TrailListingCard({ trail }: { trail: ApiTrail }) {
  const { t } = useLocale()
  return (
    <Link className="trail-list-card" to={`/trails/${trail.id}`}>
      <div className="image-wrap">
        <img src={trail.cover_image || IMG.trailA} alt={trail.name} />
        <span className={`badge ${trail.difficulty.toLowerCase()}`}>{trail.difficulty}</span>
      </div>
      <div>
        <h2>{trail.name}</h2>
        <p>{trail.description}</p>
        <div className="card-data">
          <span>
            {t('card.distance')} <strong>{formatDistance(trail.distance_km)}</strong>
          </span>
          <span>
            {t('card.elevation')} <strong>{trail.elevation_m} m</strong>
          </span>
          <span className="arrow">-&gt;</span>
        </div>
      </div>
    </Link>
  )
}

export function EventListingCard({ event }: { event: ApiEvent }) {
  const { t } = useLocale()
  const joined = event.participants_count ?? 0
  const isFull = joined >= event.participant_limit
  const label = isFull ? 'Full' : `${event.participant_limit - joined} slots left`

  return (
    <Link className="event-card" to={`/events/${event.id}`}>
      <div>
        {event.cover_image ? (
          <img src={event.cover_image} alt={event.title} />
        ) : (
          <img src={IMG.eventForest} alt={event.title} />
        )}
        <span className={isFull ? 'badge full' : 'badge orange'}>{label}</span>
      </div>
      <p className="mono">
        {formatDate(event.starts_at)} - {formatTime(event.starts_at)}
      </p>
      <h3>{event.title}</h3>
      <p>{event.description || event.destination}</p>
      {isFull && (
        <button className="button outline wide" type="button">
          {t('card.registrationClosed')}
        </button>
      )}
    </Link>
  )
}

export function Section({
  title,
  action,
  actionTo = '/trails',
  children,
  flush = false,
}: {
  title: string
  action?: string
  actionTo?: string
  children: ReactNode
  flush?: boolean
}) {
  return (
    <section className={flush ? 'section-wrap flush' : 'section-wrap'}>
      <div className="section-head">
        <h2>{title}</h2>
        {action && <Link to={actionTo}>{action}</Link>}
      </div>
      {children}
    </section>
  )
}

export function PostPreview({ post }: { post: ApiPost }) {
  const authorPath =
    post.user?.role === 'organizer' ? `/organizers/${post.user_id}` : `/profiles/${post.user_id}`

  return (
    <article className="post-preview">
      <img src={post.image || IMG.lunch} alt={post.title} />
      <div>
        <Link to={authorPath}>{post.user?.name || 'Community member'}</Link>
        <h3>{post.title}</h3>
        <p>{post.comments_count ?? 0} comments</p>
        <Link to="/community" aria-label="Open the community board">
          →
        </Link>
      </div>
    </article>
  )
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function DividerTitle({ title }: { title: string }) {
  return (
    <div className="divider-title">
      <span />
      {title}
    </div>
  )
}

export function Review({ name, date, text }: { name: string; date: string; text: string }) {
  return (
    <article className="review">
      <div>
        <strong>{name}</strong>
        <span>{date}</span>
      </div>
      <p>"{text}"</p>
    </article>
  )
}

export function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="requirement-panel">
      <h3>{title}</h3>
      {items.map((item) => (
        <p key={item}>
          <span className="material-symbols-outlined">check_circle</span>
          {item}
        </p>
      ))}
    </article>
  )
}
