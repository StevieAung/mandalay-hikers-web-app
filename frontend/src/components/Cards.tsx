import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Comment from 'reicon-react/icons/Comment'
import ThumbsUp from 'reicon-react/icons/ThumbsUp'
import type { ApiEvent, ApiPost, ApiTrail } from '../types/api'
import { VerifiedBadge } from './community/VerifiedBadge'
import { IMG } from '../data/mockData'
import { bgStyle } from '../utils/style'
import { useLocale } from '../context/useLocale'
import { formatDate, formatDistance, formatTime, trailStatusLabel } from '../utils/format'

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
        <span className={`status ${trail.status || 'open'}`}>{trailStatusLabel(trail.status)}</span>
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
      {post.image ? (
        <img src={post.image} alt={post.title} />
      ) : (
        <span className="image-placeholder">No image</span>
      )}
      <div>
        <Link className="post-preview-author" to={authorPath}>
          {post.user?.name || 'Community member'}
          {post.user?.is_verified && <VerifiedBadge size={14} />}
        </Link>
        <h3>
          <Link to={`/community/${post.id}`}>{post.title}</Link>
        </h3>
        <p className="post-preview-counts">
          <span>
            <ThumbsUp size={13} weight="Filled" /> {post.likes_count ?? 0}
          </span>
          <span>
            <Comment size={13} /> {post.comments_count ?? 0}
          </span>
        </p>
        <Link to={`/community/${post.id}`} aria-label={`Open the post ${post.title}`}>
          →
        </Link>
      </div>
    </article>
  )
}

export function Stat({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'stat wide' : 'stat'}>
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

export function Panel({ title, items }: { title?: string; items: string[] }) {
  return (
    <article className="requirement-panel">
      {title && <h3>{title}</h3>}
      {items.map((item) => (
        <p key={item}>
          <span className="material-symbols-outlined">check_circle</span>
          {item}
        </p>
      ))}
    </article>
  )
}
