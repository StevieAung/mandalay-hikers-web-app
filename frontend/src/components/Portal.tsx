import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { dashboardPathForRole } from '../utils/routes'
import { bgStyle } from '../utils/style'
import type { UserRole } from '../types'
import { Footer } from './Footer'
import { Header } from './PublicLayout'

type SidebarRole = Exclude<UserRole, 'explorer'>

export function Sidebar({ active, onNavigate }: { active: SidebarRole; onNavigate?: () => void }) {
  const { user } = useAuth()
  const navByRole = {
    organizer: [['organizer', '/organizer-dashboard', 'event_note', 'Organizer']],
    admin: [
      ['overview', '/admin', 'dashboard', 'Overview'],
      ['applications', '/admin/applications', 'how_to_reg', 'Applications'],
      ['users', '/admin/users', 'group', 'Users'],
      ['trails', '/admin/trails', 'hiking', 'Trails'],
      ['events', '/admin/events', 'event', 'Events'],
      ['posts', '/admin/posts', 'forum', 'Posts'],
      ['reports', '/admin/reports', 'flag', 'Reports'],
    ],
  } as const
  const nav = navByRole[active]

  return (
    <aside className="portal-sidebar">
      {active === 'admin' ? (
        <div className="sidebar-user admin-sidebar-user">
          <span>{user?.name || 'Admin User'}</span>
          <small>{user?.email || 'admin portal'}</small>
        </div>
      ) : (
        <div>
          <Link className="portal-logo" to={dashboardPathForRole(active)}>
            Hikers
          </Link>
          <p>Management Portal</p>
        </div>
      )}
      <nav>
        {nav.map(([key, to, icon, label]) => (
          <NavLink
            className={({ isActive }) =>
              [
                isActive || (active !== 'admin' && active === key) ? 'active' : '',
                active === 'admin' && key === 'reports' ? 'danger' : '',
              ]
                .filter(Boolean)
                .join(' ')
            }
            end={to === '/admin'}
            onClick={onNavigate}
            to={to}
            key={key}
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      {active === 'organizer' && (
        <Link className="button dark wide" to="/organizer/events/new">
          New Trek
        </Link>
      )}
      {active !== 'admin' && (
        <div className="sidebar-user">
          <InitialAvatar name={user?.name || active} />
          <span>{user?.name || 'Mandalay Hiker'}</span>
          <small>{user?.email || `${active} portal`}</small>
        </div>
      )}
    </aside>
  )
}

export function PortalShell({ active, children }: { active: UserRole; children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!drawerOpen) return

    const previousActive =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const firstLink = drawerRef.current?.querySelector<HTMLElement>('a, button')
    firstLink?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false)
        previousActive?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  return (
    <>
      <Header />
      {active === 'admin' && (
        <button className="admin-drawer-trigger" onClick={() => setDrawerOpen(true)} type="button">
          <span className="material-symbols-outlined">menu</span>
          Admin Menu
        </button>
      )}
      <main className={active === 'explorer' ? 'portal-shell no-sidebar' : 'portal-shell'}>
        {active !== 'explorer' && <Sidebar active={active} />}
        <section className="portal-content">{children}</section>
      </main>
      {active === 'admin' && drawerOpen && (
        <div className="admin-drawer-layer" role="presentation">
          <button
            aria-label="Close admin menu"
            className="admin-drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            type="button"
          />
          <div aria-label="Admin navigation" className="admin-drawer" ref={drawerRef}>
            <button
              className="admin-drawer-close"
              onClick={() => setDrawerOpen(false)}
              type="button"
            >
              <span className="material-symbols-outlined">close</span>
              Close
            </button>
            <Sidebar active={active} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
      {active !== 'admin' && <Footer />}
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
        <span>Date</span>
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
      {image ? (
        <div style={bgStyle(image)}>
          <button type="button">
            <span className="material-symbols-outlined">bookmark</span>
          </button>
          <span>{meta}</span>
          <h3>{title}</h3>
        </div>
      ) : (
        <div className="saved-trail-placeholder">
          <button type="button">
            <span className="material-symbols-outlined">bookmark</span>
          </button>
          <span>{meta}</span>
          <h3>{title}</h3>
        </div>
      )}
      <p>
        {elev}
        <Link to="/trails">Trek Now</Link>
      </p>
    </article>
  )
}

export function UserCard({
  meta = 'Explorer account',
  name = 'Mandalay Hiker',
}: {
  meta?: string
  name?: string
}) {
  return (
    <div className="user-card">
      <div>
        <strong>{name}</strong>
        <span>
          <b>{meta}</b>
        </span>
      </div>
      <InitialAvatar name={name} />
    </div>
  )
}

export function OrganizerRow({
  row,
  onManage,
  onCancel,
}: {
  row: string[]
  onManage?: () => void
  onCancel?: () => void
}) {
  const [name, date, status, participants, image] = row
  return (
    <div className="organizer-row">
      <span>
        {image ? <img src={image} alt={name} /> : <InitialAvatar name={name} />}
        <strong>{name}</strong>
      </span>
      <span>{date}</span>
      <b className={`status ${status.toLowerCase()}`}>{status}</b>
      <span>
        <strong>{participants}</strong>
        <i />
      </span>
      <span className="organizer-row-actions">
        <button aria-label={`Manage participants for ${name}`} type="button" onClick={onManage}>
          <span className="material-symbols-outlined">group</span>
        </button>
        {onCancel && status !== 'cancelled' && (
          <button aria-label={`Cancel ${name}`} type="button" onClick={onCancel}>
            <span className="material-symbols-outlined">event_busy</span>
          </button>
        )}
      </span>
    </div>
  )
}

export function InitialAvatar({ name }: { name: string }) {
  return <span className="initial-avatar">{name.trim().charAt(0).toUpperCase() || 'H'}</span>
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
