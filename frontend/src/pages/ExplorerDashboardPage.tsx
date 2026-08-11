import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Camera from 'reicon-react/icons/Camera'
import Route from 'reicon-react/icons/Route'
import Star from 'reicon-react/icons/Star'
import { DateCard, PortalSection, PortalShell, SavedTrail, UserCard } from '../components/Portal'
import { ProfileHeader } from '../components/ProfileHeader'
import { useAuth } from '../context/useAuth'
import type { ProfilePayload } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'
import { formatDate, formatDistance, formatTime } from '../utils/format'

export default function ExplorerDashboardPage() {
  const { authToken, user } = useAuth()
  const [dashboard, setDashboard] = useState<ProfilePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(authToken))
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
  const completedCount = dashboard?.user.joined_events_count ?? 0

  return (
    <PortalShell active="explorer">
      {dashboard && (
        <ProfileHeader
          badge={<span className="badge pale">{dashboard.user.role}</span>}
          isOwner
          onProfileSaved={setDashboard}
          profile={dashboard}
          stats={[
            {
              icon: <Route size={22} />,
              label: 'Completed treks',
              value: String(dashboard.user.joined_events_count ?? 0),
            },
            {
              icon: <Camera size={22} />,
              label: 'Trip posts',
              value: String(dashboard.user.posts_count ?? 0),
            },
            {
              icon: <Star size={22} />,
              label: 'Saved trails',
              value: String(dashboard.user.favorites_count ?? 0),
            },
          ]}
        />
      )}
      <div className="portal-top">
        <div>
          <span className="label orange-text">Current View</span>
          <h1>Explorer Dashboard</h1>
        </div>
        <UserCard meta={user?.email || 'Explorer account'} name={user?.name} />
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
      <PortalSection
        title="Upcoming Treks"
        meta={`${joinedEvents.length} Scheduled`}
        action="View Calendar"
      >
        {isLoading ? (
          <p className="table-empty">Loading joined events...</p>
        ) : joinedEvents.length ? (
          <div className="trek-row">
            {joinedEvents.map((event) => (
              <DateCard
                date={formatDate(event.starts_at)}
                key={event.id}
                place={event.destination}
                status={event.status}
                time={formatTime(event.starts_at)}
                title={event.title}
              />
            ))}
          </div>
        ) : (
          <p className="table-empty">You have not joined any upcoming treks yet.</p>
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
          <p className="table-empty">No saved trails yet.</p>
        )}
      </PortalSection>
    </PortalShell>
  )
}
