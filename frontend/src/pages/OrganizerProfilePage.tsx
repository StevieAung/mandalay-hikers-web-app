import { Link, Navigate, useParams } from 'react-router-dom'
import type { IconComponent } from 'reicon-react/createIcon'
import CalendarDate from 'reicon-react/icons/CalendarDate'
import MapPoint2 from 'reicon-react/icons/MapPoint2'
import RouteTrack from 'reicon-react/icons/RouteTrack'
import ShieldCheck from 'reicon-react/icons/ShieldCheck'
import Star from 'reicon-react/icons/Star'
import Users from 'reicon-react/icons/Users'
import { EventListingCard } from '../components/Cards'
import { Footer } from '../components/Footer'
import { organizerProfiles } from '../data/mockData'
import { bgStyle } from '../utils/style'
import { useLocale } from '../context/useLocale'

function OrganizerStat({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent
  label: string
  value: string
}) {
  return (
    <article className="profile-stat organizer">
      <Icon size={24} weight="Filled" />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

export default function OrganizerProfilePage() {
  const { t } = useLocale()
  const { id } = useParams()
  const profile = organizerProfiles.find((item) => item.id === id)

  if (!profile) return <Navigate to="/events" replace />

  return (
    <main>
      <section
        className="profile-hero organizer-profile-hero photo-hero"
        style={bgStyle(profile.cover)}
      >
        <div className="profile-identity">
          <img src={profile.avatar} alt={profile.name} />
          <div>
            <span className="badge dark-badge">
              <ShieldCheck size={16} weight="Filled" />
              {t('profile.verified')}
            </span>
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
              <CalendarDate size={18} />
              {t('profile.verifiedSince')} {profile.verifiedSince}
            </span>
            <span>
              <RouteTrack size={18} />
              {profile.specialty}
            </span>
          </div>
          <Link className="button cta wide" to="/events">
            {t('profile.viewEvents')}
          </Link>
        </aside>
        <div className="profile-main">
          <div className="profile-stats">
            <OrganizerStat
              icon={CalendarDate}
              label={t('profile.hosted')}
              value={profile.stats.events}
            />
            <OrganizerStat
              icon={Users}
              label={t('profile.participants')}
              value={profile.stats.hikers}
            />
            <OrganizerStat
              icon={Star}
              label={t('profile.avgRating')}
              value={profile.stats.rating}
            />
          </div>
          <section className="profile-panel">
            <div className="profile-panel-head">
              <h2>{t('profile.upcoming')}</h2>
              <Link to="/events">{t('home.calendar')}</Link>
            </div>
            <div className="profile-event-grid">
              {profile.upcomingEvents.map((event) => (
                <EventListingCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}
