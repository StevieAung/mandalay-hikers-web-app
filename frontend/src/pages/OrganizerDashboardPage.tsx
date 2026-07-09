import { Link } from 'react-router-dom'
import { Metric, OrganizerRow, PortalShell } from '../components/Portal'
import { IMG } from '../data/mockData'

export default function OrganizerDashboardPage() {
  return (
    <PortalShell active="organizer">
      <div className="portal-title-row">
        <div>
          <span className="label orange-text">Organizer Dashboard</span>
          <h1>Managed Events</h1>
        </div>
        <Link className="button brown" to="/organizer/events/new">
          <span className="material-symbols-outlined">add_circle</span>Create New Event
        </Link>
      </div>
      <div className="data-table">
        <div className="table-head">
          <span>Event Name</span>
          <span>Date</span>
          <span>Status</span>
          <span>Participants</span>
          <span>Actions</span>
        </div>
        {[
          ['Dawn over Yankin Hill', 'Oct 24, 2024', 'Upcoming', '12 / 20', IMG.eventHero],
          ['Mandalay Ridge Traverse', 'Oct 28, 2024', 'Full', '15 / 15', IMG.trailD],
          ['Pyin Oo Lwin Highlands', 'Oct 12, 2024', 'Completed', '24 / 25', IMG.detailMap],
        ].map((row) => (
          <OrganizerRow key={row[0]} row={row} />
        ))}
      </div>
      <div className="portal-stats three">
        <Metric title="Active Hikers" value="142" icon="groups" />
        <Metric title="Upcoming Kilometers" value="84.5 km" icon="route" />
        <Metric title="Safety Alerts" value="02" icon="warning" alert />
      </div>
    </PortalShell>
  )
}
