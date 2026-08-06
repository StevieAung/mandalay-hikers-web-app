import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CalendarDate from 'reicon-react/icons/CalendarDate'
import MapPoint2 from 'reicon-react/icons/MapPoint2'
import RouteTrack from 'reicon-react/icons/RouteTrack'
import ShieldCheck from 'reicon-react/icons/ShieldCheck'
import Users from 'reicon-react/icons/Users'
import { Footer } from '../components/Footer'
import { ProfileHeader } from '../components/ProfileHeader'
import { useAuth } from '../context/useAuth'
import { useLocale } from '../context/useLocale'
import type { ApiEvent, ProfilePayload } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'
import { formatDate } from '../utils/format'

function HostedEventCard({ event }: { event: ApiEvent }) {
  return (
    <article className="profile-event-card">
      {event.cover_image ? (
        <img src={event.cover_image} alt={event.title} />
      ) : (
        <span className="image-placeholder">No image</span>
      )}
      <span className="badge orange">{event.status}</span>
      <p className="mono">{formatDate(event.starts_at)}</p>
      <h3>{event.title}</h3>
      <p>{event.destination}</p>
    </article>
  )
}

export default function OrganizerProfilePage() {
  const { t } = useLocale()
  const { user: authUser } = useAuth()
  const { id } = useParams()
  const [profile, setProfile] = useState<ProfilePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiRequest<ProfilePayload>(`/api/profiles/${id}`)
        setProfile(response)
        setError(null)
      } catch (requestError) {
        setError(
          requestError instanceof ApiError ? requestError.message : 'Could not load this profile.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [id])

  if (isLoading) return <main className="route-loading">Loading profile</main>

  if (error || !profile) {
    return (
      <main>
        <section className="profile-layout single">
          <p className="table-empty danger">{error || 'Profile not found.'}</p>
        </section>
        <Footer />
      </main>
    )
  }

  const user = profile.user
  const details = user.profile
  const hostedEvents = profile.hosted_events
  const participantTotal = hostedEvents.reduce(
    (sum, event) => sum + (event.participants_count ?? 0),
    0,
  )
  const verifiedDate = profile.approved_organizer_application?.reviewed_at
  const isOwner = Boolean(authUser?.id && Number(id) === authUser.id)

  return (
    <main>
      <ProfileHeader
        badge={
          <span className="badge dark-badge">
            <ShieldCheck size={16} weight="Filled" />
            {user.role === 'organizer' ? t('profile.verified') : user.role}
          </span>
        }
        isOwner={isOwner}
        onProfileSaved={setProfile}
        profile={profile}
        stats={[
          {
            icon: <CalendarDate size={22} weight="Filled" />,
            label: t('profile.hosted'),
            value: String(hostedEvents.length),
          },
          {
            icon: <Users size={22} weight="Filled" />,
            label: t('profile.participants'),
            value: String(participantTotal),
          },
          {
            icon: <RouteTrack size={22} weight="Filled" />,
            label: 'Role',
            value: user.role,
          },
        ]}
      />
      <section className="profile-layout">
        <aside className="profile-side">
          <p className="profile-bio">
            {details?.bio || 'This organizer has not added a profile bio yet.'}
          </p>
          <div className="profile-meta">
            <span>
              <MapPoint2 size={18} />
              {details?.location || 'Location not added'}
            </span>
            <span>
              <CalendarDate size={18} />
              {verifiedDate
                ? `${t('profile.verifiedSince')} ${formatDate(verifiedDate)}`
                : user.role}
            </span>
            <span>
              <RouteTrack size={18} />
              {hostedEvents.length} hosted events
            </span>
          </div>
          <Link className="button cta wide" to="/events">
            {t('profile.viewEvents')}
          </Link>
        </aside>
        <div className="profile-main">
          <section className="profile-panel">
            <div className="profile-panel-head">
              <h2>{t('profile.upcoming')}</h2>
              <Link to="/events">{t('home.calendar')}</Link>
            </div>
            {hostedEvents.length ? (
              <div className="profile-event-grid">
                {hostedEvents.map((event) => (
                  <HostedEventCard event={event} key={event.id} />
                ))}
              </div>
            ) : (
              <p className="table-empty">No hosted events yet.</p>
            )}
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}
