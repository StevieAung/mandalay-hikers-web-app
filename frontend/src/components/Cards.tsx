import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { CommunityPost, Trail, TrekEvent } from '../types'
import { bgStyle } from '../utils/style'

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

export function TrailListingCard({ trail }: { trail: Trail }) {
  return (
    <Link className="trail-list-card" to={`/trails/${trail.id}`}>
      <div className="image-wrap">
        <img src={trail.image} alt={trail.name} />
        <span className={`badge ${trail.difficulty.toLowerCase()}`}>{trail.badge}</span>
      </div>
      <div>
        <h2>{trail.name}</h2>
        <p>{trail.summary}</p>
        <div className="card-data">
          <span>
            Dist <strong>{trail.distance}</strong>
          </span>
          <span>
            Elev <strong>{trail.elevation}</strong>
          </span>
          <span className="arrow">-&gt;</span>
        </div>
      </div>
    </Link>
  )
}

export function EventListingCard({ event }: { event: TrekEvent }) {
  return (
    <Link className="event-card" to={`/events/${event.id}`}>
      <div>
        <img src={event.image} alt={event.title} />
        <span className={event.status === 'Full' ? 'badge full' : 'badge orange'}>
          {event.status}
        </span>
      </div>
      <p className="mono">
        {event.date} - {event.time}
      </p>
      <h3>{event.title}</h3>
      <p>{event.text}</p>
      {event.status === 'Full' && (
        <button className="button outline wide" type="button">
          Registration Closed
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
        <button type="button" aria-label="Like">
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
