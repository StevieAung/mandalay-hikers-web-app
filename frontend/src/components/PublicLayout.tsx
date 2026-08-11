import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import AngleDown2 from 'reicon-react/icons/AngleDown2'
import ShieldCheck from 'reicon-react/icons/ShieldCheck'
import User from 'reicon-react/icons/User'
import { useAuth } from '../context/useAuth'
import { dashboardPathForRole } from '../utils/routes'
import { LanguageToggle } from './LanguageToggle'
import { useLocale } from '../context/useLocale'

export function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

export function Header() {
  const { user, logout } = useAuth()
  const { t } = useLocale()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const portalPath = user ? dashboardPathForRole(user.role) : '/login'
  const profilePath =
    user?.id && user.role === 'organizer'
      ? `/organizers/${user.id}`
      : user?.id && user.role === 'explorer'
        ? `/profiles/${user.id}`
        : null
  const isVerifiedOrganizer = user?.role === 'organizer'
  const isCurrentPath = (path: string) => pathname === path

  return (
    <header className="site-header">
      <Link className="logo" to="/">
        Hikers
      </Link>
      <button
        className="icon-button menu-button"
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t('nav.menu')}
      >
        <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
      </button>
      <nav className={open ? 'top-nav open' : 'top-nav'}>
        <NavLink to="/trails">{t('nav.trails')}</NavLink>
        <NavLink to="/events">{t('nav.events')}</NavLink>
        <NavLink to="/community">{t('nav.community')}</NavLink>
      </nav>
      <div className={open ? 'header-actions open' : 'header-actions'}>
        <LanguageToggle />
        <Link className="search-icon" to="/trails" aria-label={t('nav.search')}>
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
              {profilePath && (
                <MenuLink current={isCurrentPath(profilePath)} to={profilePath}>
                  {t('nav.profile')}
                </MenuLink>
              )}
              <MenuLink current={isCurrentPath(portalPath)} to={portalPath}>
                {t('nav.dashboard')}
              </MenuLink>
              {(user.role === 'explorer' || user.role === 'organizer') && (
                <MenuLink
                  className={isVerifiedOrganizer ? 'verified-menu-item' : ''}
                  current={isCurrentPath('/organizer/apply')}
                  to="/organizer/apply"
                >
                  {isVerifiedOrganizer && <ShieldCheck size={18} weight="Filled" />}
                  {isVerifiedOrganizer ? 'Organizer Verified' : 'Organizer Application'}
                </MenuLink>
              )}
              <button type="button" onClick={logout}>
                {t('nav.logout')}
              </button>
            </div>
          </div>
        ) : (
          <Link className="button dark" to="/login">
            {t('nav.signIn')}
          </Link>
        )}
      </div>
    </header>
  )
}

function MenuLink({
  children,
  className = '',
  current,
  to,
}: {
  children: ReactNode
  className?: string
  current: boolean
  to: string
}) {
  return (
    <Link
      aria-current={current ? 'page' : undefined}
      className={`${className} ${current ? 'current-menu-item' : ''}`.trim()}
      to={to}
    >
      {children}
      {current && <b>Current</b>}
    </Link>
  )
}
