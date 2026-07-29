import { Link, Navigate, useParams } from 'react-router-dom'
import type { IconComponent } from 'reicon-react/createIcon'
import Camera from 'reicon-react/icons/Camera'
import MapPoint2 from 'reicon-react/icons/MapPoint2'
import MessageDots from 'reicon-react/icons/MessageDots'
import Route from 'reicon-react/icons/Route'
import Star from 'reicon-react/icons/Star'
import User from 'reicon-react/icons/User'
import { Footer } from '../components/Footer'
import { explorerProfiles } from '../data/mockData'
import { bgStyle } from '../utils/style'
import { useLocale } from '../context/useLocale'

function ProfileStat({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent
  label: string
  value: string
}) {
  return (
    <article className="profile-stat">
      <Icon size={24} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

export default function ExplorerProfilePage() {
  const { t } = useLocale()
  const { id } = useParams()
  const profile = explorerProfiles.find((item) => item.id === id)

  if (!profile) return <Navigate to="/community" replace />

  return (
    <main>
      <section className="profile-hero photo-hero" style={bgStyle(profile.cover)}>
        <div className="profile-identity">
          <img src={profile.avatar} alt={profile.name} />
          <div>
            <span className="badge pale">{profile.level}</span>
            <h1>{profile.name}</h1>
            <p>{profile.handle}</p>
          </div>
        </div>
      </section>
      <section className="profile-layout">
        <aside className="profile-side">
          <p className="profile-bio">{profile.bio}</p>
          <div className="profile-meta">
            <span>
              <MapPoint2 size={18} />
              {profile.location}
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
          <div className="profile-stats">
            <ProfileStat icon={Route} label={t('profile.completed')} value={profile.stats.treks} />
            <ProfileStat icon={Camera} label={t('profile.posts')} value={profile.stats.posts} />
            <ProfileStat icon={Star} label={t('profile.saved')} value={profile.stats.saved} />
          </div>
          <section className="profile-panel">
            <div className="profile-panel-head">
              <h2>{t('profile.favorite')}</h2>
              <Link to="/trails">{t('profile.explore')}</Link>
            </div>
            <div className="profile-chip-list">
              {profile.favoriteTrails.map((trail) => (
                <span key={trail}>{trail}</span>
              ))}
            </div>
          </section>
          <section className="profile-panel">
            <div className="profile-panel-head">
              <h2>{t('profile.recent')}</h2>
              <Link to="/community">{t('profile.allPosts')}</Link>
            </div>
            <div className="profile-post-grid">
              {profile.recentPosts.map((post) => (
                <article key={post.id} className="profile-post-card">
                  <img src={post.image} alt={post.title} />
                  <span>{post.likes}</span>
                  <h3>{post.title}</h3>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}
