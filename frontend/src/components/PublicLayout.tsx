import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import AngleDown2 from 'reicon-react/icons/AngleDown2'
import User from 'reicon-react/icons/User'
import { useAuth } from '../context/useAuth'

export function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

function Header() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const portalPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'organizer' ? '/organizer' : '/dashboard'
  const profilePath =
    user?.role === 'organizer'
      ? '/organizers/mandalay-treks'
      : user?.role === 'explorer'
        ? '/profiles/kyaw-hiker'
        : null

  return (
    <header className="site-header">
      <Link className="logo" to="/">
        Hikers
      </Link>
      <button
        className="icon-button menu-button"
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
      </button>
      <nav className={open ? 'top-nav open' : 'top-nav'}>
        <NavLink to="/trails">Trails</NavLink>
        <NavLink to="/events">Events</NavLink>
        <NavLink to="/community">Community</NavLink>
      </nav>
      <div className="header-actions">
        <Link className="search-icon" to="/trails" aria-label="Search trails">
          <span className="material-symbols-outlined">search</span>
        </Link>
        {user ? (
          <div className="user-menu">
            <Link className="button outline user-menu-trigger" to={portalPath}>
              <User size={16} />
              {user.role}
              <AngleDown2 size={14} />
            </Link>
            <div className="user-menu-panel">
              <span>{user.name}</span>
              {profilePath && <Link to={profilePath}>Profile</Link>}
              <Link to={portalPath}>Dashboard</Link>
              {user.role === 'explorer' && <Link to="/organizer/apply">Organizer Application</Link>}
              <button type="button" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link className="button dark" to="/login">
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
