import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
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
          <>
            <Link className="button outline" to={portalPath}>
              {user.role}
            </Link>
            <button className="button outline" type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link className="button dark" to="/login">
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
