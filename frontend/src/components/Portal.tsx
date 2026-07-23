import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IMG } from '../data/mockData'
import { dashboardPathForRole } from '../utils/routes'
import { bgStyle } from '../utils/style'
import type { UserRole } from '../types'
import { Footer } from './Footer'
import { Header } from './PublicLayout'

export function Sidebar({ active }: { active: UserRole }) {
  const navByRole = {
    explorer: [['explorer', '/explorer-dashboard', 'explore', 'Explorer']],
    organizer: [['organizer', '/organizer-dashboard', 'event_note', 'Organizer']],
    admin: [['admin', '/admin', 'admin_panel_settings', 'Admin']],
  } as const
  const nav = navByRole[active]

  return (
    <aside className="portal-sidebar">
      <div>
        <Link className="portal-logo" to={dashboardPathForRole(active)}>
          {active === 'admin' ? 'Mandalay' : active === 'explorer' ? 'Mandalay Trails' : 'Hikers'}
        </Link>
        <p>Management Portal</p>
      </div>
      <nav>
        {nav.map(([key, to, icon, label]) => (
          <Link className={active === key ? 'active' : ''} to={to} key={key}>
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
      {active === 'organizer' && (
        <Link className="button dark wide" to="/organizer/events/new">
          New Trek
        </Link>
      )}
      <div className="sidebar-user">
        <img src={IMG.avatar} alt="User" />
        <span>
          {active === 'admin'
            ? 'Zaw Min'
            : active === 'organizer'
              ? 'Mandalay Trails'
              : 'Aung Kyaw'}
        </span>
        <small>{active === 'admin' ? 'Chief Administrator' : 'Management Portal'}</small>
      </div>
    </aside>
  )
}

export function PortalShell({ active, children }: { active: UserRole; children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="portal-shell">
        <Sidebar active={active} />
        <section className="portal-content">{children}</section>
      </main>
      <Footer />
    </>
  )
}

export function PortalSection({
  title,
  meta,
  action,
  children,
}: {
  title: string
  meta: string
  action?: string
  children: ReactNode
}) {
  return (
    <section className="portal-section">
      <div className="portal-section-head">
        <h2>
          {title} <span>{meta}</span>
        </h2>
        {action && <button type="button">{action}</button>}
      </div>
      {children}
    </section>
  )
}

export function DateCard({
  date,
  time,
  title,
  place,
  status,
  muted = false,
}: {
  date: string
  time: string
  title: string
  place: string
  status: string
  muted?: boolean
}) {
  return (
    <article className={muted ? 'date-card muted' : 'date-card'}>
      <div>
        <span>Oct</span>
        <strong>{date}</strong>
        <small>{time}</small>
      </div>
      <section>
        <h3>{title}</h3>
        <p>
          <span className="material-symbols-outlined">location_on</span>
          {place}
        </p>
      </section>
      <b>{status}</b>
    </article>
  )
}

export function SavedTrail({
  title,
  meta,
  elev,
  image,
}: {
  title: string
  meta: string
  elev: string
  image: string
}) {
  return (
    <article className="saved-trail">
      <div style={bgStyle(image)}>
        <button type="button">
          <span className="material-symbols-outlined">bookmark</span>
        </button>
        <span>{meta}</span>
        <h3>{title}</h3>
      </div>
      <p>
        {elev}
        <Link to="/trails">Trek Now</Link>
      </p>
    </article>
  )
}

export function UserCard({ name = 'Aung Kyaw' }: { name?: string }) {
  return (
    <div className="user-card">
      <div>
        <strong>{name}</strong>
        <span>
          <b>24</b> Total Treks
        </span>
      </div>
      <img src={IMG.avatar} alt={name} />
    </div>
  )
}

export function OrganizerRow({ row }: { row: string[] }) {
  const [name, date, status, participants, image] = row
  return (
    <div className="organizer-row">
      <span>
        <img src={image} alt={name} />
        <strong>{name}</strong>
      </span>
      <span>{date}</span>
      <b className={`status ${status.toLowerCase()}`}>{status}</b>
      <span>
        <strong>{participants}</strong>
        <i />
      </span>
      <button type="button">
        <span className="material-symbols-outlined">
          {status === 'Completed' ? 'analytics' : 'edit'}
        </span>
      </button>
    </div>
  )
}

export function Metric({
  title,
  value,
  icon,
  accent = false,
  danger = false,
  alert = false,
}: {
  title: string
  value: string
  icon?: string
  accent?: boolean
  danger?: boolean
  alert?: boolean
}) {
  return (
    <article className="portal-metric">
      <span>{title}</span>
      <strong className={danger ? 'danger' : accent || alert ? 'accent' : ''}>{value}</strong>
      {icon && <i className="material-symbols-outlined">{icon}</i>}
    </article>
  )
}
