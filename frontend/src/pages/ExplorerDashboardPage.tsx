import { Link } from 'react-router-dom'
import { DateCard, PortalSection, PortalShell, SavedTrail, UserCard } from '../components/Portal'
import { useAuth } from '../context/useAuth'
import { IMG } from '../data/mockData'

export default function ExplorerDashboardPage() {
  const { user, applications } = useAuth()
  const application = applications.find((item) => item.email === user?.email)

  return (
    <PortalShell active="explorer">
      <div className="portal-top">
        <div>
          <span className="label orange-text">Current View</span>
          <h1>Explorer Dashboard</h1>
        </div>
        <UserCard name={user?.name} />
      </div>
      <div className="explorer-hero-row">
        <article className="dark-callout">
          <h2>Ready for the next trail?</h2>
          <p>
            Your explorer account can browse trails, join hikes, save favorites, and apply to lead
            community events.
          </p>
          <Link className="button cta" to="/organizer/apply">
            {application ? `Application ${application.status}` : 'Apply to Organize'}
          </Link>
        </article>
        <article className="completion-card">
          <span>Trail Completion</span>
          <strong>84%</strong>
          <p>Season Goal</p>
          <div>
            <i />
          </div>
        </article>
      </div>
      <PortalSection title="Upcoming Treks" meta="03 Scheduled" action="View Calendar">
        <div className="trek-row">
          <DateCard
            date="14"
            time="06:00 AM"
            title="Sagaing Hill Sunrise Path"
            place="Sagaing, Mandalay"
            status="Confirmed"
          />
          <DateCard
            date="21"
            time="05:30 AM"
            title="Dee Doke Waterfall Climb"
            place="Pyin Oo Lwin Road"
            status="Waitlist"
            muted
          />
        </div>
      </PortalSection>
      <PortalSection title="Saved Trails" meta="08 Bookmarked">
        <div className="saved-grid">
          {[
            ['U-Bein Ridge Pass', 'Moderate - 12km', 'Elev: 450m', IMG.trailD],
            ['Royal Moat Perimeter', 'Easy - 8km', 'Elev: 20m', IMG.avatar],
            ['Yankin Summit Climb', 'Hard - 15km', 'Elev: 980m', IMG.trailC],
            ['Irrawaddy Shore Path', 'Easy - 6km', 'Elev: 10m', IMG.trailF],
          ].map(([title, meta, elev, image]) => (
            <SavedTrail key={title} title={title} meta={meta} elev={elev} image={image} />
          ))}
        </div>
      </PortalSection>
    </PortalShell>
  )
}
