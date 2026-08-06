import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { CommunityPost, Trail, TrekEvent } from '../types'
import type { ApiTrail } from '../types/api'
import { IMG } from '../data/mockData'
import { bgStyle } from '../utils/style'
import { useLocale } from '../context/useLocale'
import { formatEventDate } from '../utils/date'
import { formatDistance } from '../utils/format'

export function OverlayTrail({ trail }: { trail: Trail }) {
  return (
    <Link className="overlay-card" to={`/trails/${trail.id}`} style={bgStyle(trail.image)}>
      <span>
        {trail.difficulty} - {trail.distance}
      </span>
      <h3>{trail.name.replace('Path', '')}</h3>
      <p>{trail.summary}</p>
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

export function EventListingCard({ event }: { event: TrekEvent }) {
  const { locale, t } = useLocale()
  return (
    <Link className="event-card" to={`/events/${event.id}`}>
      <div>
        <img src={event.image} alt={event.title} />
        <span className={event.status === 'Full' ? 'badge full' : 'badge orange'}>
          {event.status}
        </span>
      </div>
      <p className="mono">{formatEventDate(event.date, event.time, locale)}</p>
      <h3>{event.title}</h3>
      <p>{event.text}</p>
      {event.status === 'Full' && (
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

export function PostPreview({ post }: { post: CommunityPost }) {
  const { t } = useLocale()
  const authorPath =
    post.authorId === 'mandalay-treks'
      ? `/organizers/${post.authorId}`
      : `/profiles/${post.authorId}`

  return (
    <article className="post-preview">
      <img src={post.image} alt={post.title} />
      <div>
        <Link to={authorPath}>{post.handle}</Link>
        <h3>{post.title}</h3>
        <p>{post.likes}</p>
        <button type="button" aria-label={t('card.like')}>
          ♡
        </button>
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
