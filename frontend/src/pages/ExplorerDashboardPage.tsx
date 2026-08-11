import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DateCard, PortalSection, PortalShell, SavedTrail } from '../components/Portal'
import { TrekCalendar } from '../components/TrekCalendar'
import { useAuth } from '../context/useAuth'
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
  const [dashboard, setDashboard] = useState<ProfilePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(authToken))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const application = dashboard?.latest_organizer_application

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
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Could not load your dashboard data.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [authToken])

  const joinedEvents = dashboard?.joined_events ?? []
  const favoriteTrails = dashboard?.favorites ?? []
  const myPosts = dashboard?.posts ?? []
  const completedCount = dashboard?.user.joined_events_count ?? 0
  const visibleTreks = selectedDay
    ? joinedEvents.filter((event) => toDayKey(event.starts_at) === selectedDay)
    : joinedEvents

  return (
    <PortalShell active="explorer">
      <div className="portal-top">
        <div>
          <span className="label orange-text">Current View</span>
          <h1>Explorer Dashboard</h1>
        </div>
        {user?.id && (
          <Link className="button outline" to={`/profiles/${user.id}`}>
            View my profile
          </Link>
        )}
      </div>
      <div className="explorer-hero-row">
        <article className="dark-callout">
          <h2>Welcome back, {user?.name || 'Explorer'}.</h2>
          <p>
            Your explorer account can browse trails, join hikes, save favorites, and apply to lead
            community events.
          </p>
          <Link className="button cta" to="/organizer/apply">
            {application ? `Application ${application.status}` : 'Apply to Organize'}
          </Link>
        </article>
        <article className="completion-card">
          <span>Account Activity</span>
          <strong>{completedCount}</strong>
          <p>Joined Treks</p>
          <div>
            <i />
          </div>
        </article>
      </div>
      {error && <p className="table-empty danger">{error}</p>}
      <PortalSection title="Upcoming Treks" meta={`${joinedEvents.length} Scheduled`}>
        {isLoading ? (
          <p className="table-empty">Loading joined events...</p>
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
                    key={event.id}
                    place={event.destination}
                    status={event.status}
                    time={formatTime(event.starts_at)}
                    title={event.title}
                  />
                ))
              ) : (
                <p className="table-empty">No treks on the selected day.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="table-empty">
            You have not joined any upcoming treks yet. <Link to="/events">Browse events</Link>
          </p>
        )}
      </PortalSection>
      <PortalSection title="Saved Trails" meta={`${favoriteTrails.length} Bookmarked`}>
        {isLoading ? (
          <p className="table-empty">Loading saved trails...</p>
        ) : favoriteTrails.length ? (
          <div className="saved-grid">
            {favoriteTrails.map((trail) => (
              <SavedTrail
                elev={`Elev: ${trail.elevation_m}m`}
                image={trail.cover_image || ''}
                key={trail.id}
                meta={`${trail.difficulty} - ${formatDistance(trail.distance_km)}`}
                title={trail.name}
              />
            ))}
          </div>
        ) : (
          <p className="table-empty">
            No saved trails yet. <Link to="/trails">Find a trail</Link>
          </p>
        )}
      </PortalSection>
      <PortalSection title="My Community Posts" meta={`${myPosts.length} Shared`}>
        {isLoading ? (
          <p className="table-empty">Loading your posts...</p>
        ) : myPosts.length ? (
          <div className="profile-post-grid">
            {myPosts.map((post) => (
              <Link className="profile-post-card" key={post.id} to={`/community/${post.id}`}>
                {post.image ? (
                  <img src={post.image} alt={post.title} />
                ) : (
                  <span className="image-placeholder">No image</span>
                )}
                <span>
                  {formatRelativeTime(post.created_at)} - {post.comments_count ?? 0} comments
                </span>
                <h3>{post.title}</h3>
              </Link>
            ))}
          </div>
        ) : (
          <p className="table-empty">
            You have not shared any community posts yet. <Link to="/community">Post an update</Link>
          </p>
        )}
      </PortalSection>
    </PortalShell>
  )
}
