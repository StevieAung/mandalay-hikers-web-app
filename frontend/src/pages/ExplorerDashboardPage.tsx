import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Stat } from '../components/Cards'
import { DateCard, PortalSection, PortalShell, SavedTrail } from '../components/Portal'
import { TrekCalendar } from '../components/TrekCalendar'
import { useAuth } from '../context/useAuth'
import { useLocale } from '../context/useLocale'
import type { ProfilePayload } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'
import {
  formatDate,
  formatDistance,
  formatRelativeTime,
  formatTime,
  toDayKey,
} from '../utils/format'

export default function ExplorerDashboardPage() {
  const { authToken, user } = useAuth()
  const { t } = useLocale()
  const [dashboard, setDashboard] = useState<ProfilePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(authToken))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    if (!authToken) return

    const loadDashboard = async () => {
      try {
        const response = await apiRequest<ProfilePayload>('/api/me/dashboard', {
          token: authToken,
        })
        setDashboard(response)
        setError(null)
      } catch (requestError) {
        setError(requestError instanceof ApiError ? requestError.message : t('dashboard.loadError'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [authToken, t])

  const joinedEvents = dashboard?.joined_events ?? []
  const favoriteTrails = dashboard?.favorites ?? []
  const myPosts = dashboard?.posts ?? []
  const visibleTreks = selectedDay
    ? joinedEvents.filter((event) => toDayKey(event.starts_at) === selectedDay)
    : joinedEvents

  return (
    <PortalShell active="explorer">
      <div className="dashboard-welcome-banner">
        <div>
          <span className="label orange-text">{t('dashboard.currentView')}</span>
          <h1>{t('dashboard.title')}</h1>
          <p className="portal-top-description">
            {t('dashboard.welcomeBack')} {user?.name || t('dashboard.explorerFallback')}.{' '}
            {t('dashboard.welcomeSummary')}
          </p>
        </div>
        <div className="portal-top-actions">
          <div className="portal-top-stats">
            <div className="portal-top-stat-card">
              <Stat label={t('dashboard.statsTreks')} value={String(joinedEvents.length)} />
            </div>
            <div className="portal-top-stat-card">
              <Stat label={t('dashboard.statsSaved')} value={String(favoriteTrails.length)} />
            </div>
            <div className="portal-top-stat-card">
              <Stat label={t('dashboard.statsPosts')} value={String(myPosts.length)} />
            </div>
          </div>
          {user?.id && (
            <Link className="button outline" to={`/profiles/${user.id}`}>
              {t('dashboard.viewProfile')}
            </Link>
          )}
        </div>
      </div>
      {error && <p className="table-empty danger">{error}</p>}
      <PortalSection
        title={t('dashboard.upcomingTreks')}
        meta={`${joinedEvents.length} ${t('dashboard.scheduled')}`}
      >
        {isLoading ? (
          <p className="table-empty">{t('dashboard.loadingEvents')}</p>
        ) : joinedEvents.length ? (
          <div className="trek-calendar-layout">
            <TrekCalendar
              events={joinedEvents}
              onSelectDay={setSelectedDay}
              selectedDay={selectedDay}
            />
            <div className="trek-list">
              {visibleTreks.length ? (
                visibleTreks.map((event) => (
                  <DateCard
                    date={formatDate(event.starts_at)}
                    dateLabel={t('dashboard.dateLabel')}
                    key={event.id}
                    place={event.destination}
                    status={event.status}
                    time={formatTime(event.starts_at)}
                    title={event.title}
                  />
                ))
              ) : (
                <p className="table-empty">{t('dashboard.noTreksOnDay')}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="table-empty">
            {t('dashboard.noJoinedTreks')} <Link to="/events">{t('dashboard.browseEvents')}</Link>
          </p>
        )}
      </PortalSection>
      <PortalSection
        title={t('dashboard.savedTrails')}
        meta={`${favoriteTrails.length} ${t('dashboard.bookmarked')}`}
      >
        {isLoading ? (
          <p className="table-empty">{t('dashboard.loadingSaved')}</p>
        ) : favoriteTrails.length ? (
          <div className="saved-grid">
            {favoriteTrails.map((trail) => (
              <SavedTrail
                elev={`${t('card.elevation')}: ${trail.elevation_m}m`}
                image={trail.cover_image || ''}
                key={trail.id}
                meta={`${trail.difficulty} - ${formatDistance(trail.distance_km)}`}
                title={trail.name}
                to={`/trails/${trail.id}`}
                trekNowLabel={t('dashboard.trekNow')}
              />
            ))}
          </div>
        ) : (
          <p className="table-empty">
            {t('dashboard.noSavedTrails')} <Link to="/trails">{t('dashboard.findTrail')}</Link>
          </p>
        )}
      </PortalSection>
      <PortalSection
        title={t('dashboard.myPosts')}
        meta={`${myPosts.length} ${t('dashboard.shared')}`}
      >
        {isLoading ? (
          <p className="table-empty">{t('dashboard.loadingPosts')}</p>
        ) : myPosts.length ? (
          <div className="profile-post-grid">
            {myPosts.map((post) => (
              <Link className="profile-post-card" key={post.id} to={`/community/${post.id}`}>
                {post.image && <img src={post.image} alt={post.title} />}
                <span>
                  {formatRelativeTime(post.created_at)} - {post.comments_count ?? 0}{' '}
                  {t('community.commentCount')}
                </span>
                <h3>{post.title}</h3>
              </Link>
            ))}
          </div>
        ) : (
          <p className="table-empty">
            {t('dashboard.noPosts')} <Link to="/community">{t('dashboard.postUpdate')}</Link>
          </p>
        )}
      </PortalSection>
    </PortalShell>
  )
}
