import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Camera from 'reicon-react/icons/Camera'
import MapPoint2 from 'reicon-react/icons/MapPoint2'
import MessageDots from 'reicon-react/icons/MessageDots'
import Route from 'reicon-react/icons/Route'
import Star from 'reicon-react/icons/Star'
import User from 'reicon-react/icons/User'
import { Footer } from '../components/Footer'
import { ProfileHeader } from '../components/ProfileHeader'
import { useAuth } from '../context/useAuth'
import { useLocale } from '../context/useLocale'
import type { ProfilePayload } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'
import { formatDistance } from '../utils/format'

export default function ExplorerProfilePage() {
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
  const isOwner = Boolean(authUser?.id && Number(id) === authUser.id)

  return (
    <main>
      <ProfileHeader
        badge={<span className="badge pale">{user.role}</span>}
        isOwner={isOwner}
        onProfileSaved={setProfile}
        profile={profile}
        stats={[
          {
            icon: <Route size={22} />,
            label: t('profile.completed'),
            value: String(user.joined_events_count ?? 0),
          },
          {
            icon: <Camera size={22} />,
            label: t('profile.posts'),
            value: String(user.posts_count ?? 0),
          },
          {
            icon: <Star size={22} />,
            label: t('profile.saved'),
            value: String(user.favorites_count ?? 0),
          },
        ]}
      />
      <section className="profile-layout">
        <aside className="profile-side">
          <p className="profile-bio">
            {details?.bio || 'This hiker has not added a profile bio yet.'}
          </p>
          <div className="profile-meta">
            <span>
              <MapPoint2 size={18} />
              {details?.location || 'Location not added'}
            </span>
            <span>
              <User size={18} />
              {t('profile.communityExplorer')}
            </span>
          </div>
          <Link className="button cta wide" to="/community">
            <MessageDots size={18} />
            {t('profile.viewCommunity')}
          </Link>
        </aside>
        <div className="profile-main">
          <section className="profile-panel">
            <div className="profile-panel-head">
              <h2>{t('profile.favorite')}</h2>
              <Link to="/trails">{t('profile.explore')}</Link>
            </div>
            {profile.favorites.length ? (
              <div className="profile-chip-list">
                {profile.favorites.map((trail) => (
                  <span key={trail.id}>
                    {trail.name} - {trail.difficulty} - {formatDistance(trail.distance_km)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="table-empty">No favorite trails yet.</p>
            )}
          </section>
          <section className="profile-panel">
            <div className="profile-panel-head">
              <h2>{t('profile.recent')}</h2>
              <Link to="/community">{t('profile.allPosts')}</Link>
            </div>
            {profile.posts.length ? (
              <div className="profile-post-grid">
                {profile.posts.map((post) => (
                  <article key={post.id} className="profile-post-card">
                    {post.image && <img src={post.image} alt={post.title} />}
                    <span>{post.comments_count ?? 0} comments</span>
                    <h3>{post.title}</h3>
                  </article>
                ))}
              </div>
            ) : (
              <p className="table-empty">No community posts yet.</p>
            )}
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}
