import { Metric, PortalShell } from '../components/Portal'
import { useAuth } from '../context/useAuth'
import type { OrganizerApplication } from '../types'

const demoApplications: OrganizerApplication[] = [
  {
    id: 'APP-921',
    name: 'Htet Aung',
    email: 'htet@example.com',
    reason: 'Senior trekker',
    status: 'pending',
  },
  {
    id: 'APP-894',
    name: 'May Phyo',
    email: 'may@example.com',
    reason: 'Mountain guide',
    status: 'approved',
  },
  {
    id: 'APP-888',
    name: 'Kyaw Zwa',
    email: 'kyaw@example.com',
    reason: 'Basic organizer',
    status: 'pending',
  },
]

export default function AdminDashboardPage() {
  const { applications, approveOrganizer } = useAuth()
  const rows = applications.length ? applications : demoApplications
  const pendingCount = rows.filter((item) => item.status === 'pending').length

  return (
    <PortalShell active="admin">
      <div className="portal-title-row">
        <div>
          <h1 className="command-title">
            Mandalay <strong>Command</strong>
          </h1>
          <p>Overseeing regional trail logistics and personnel operations.</p>
        </div>
        <div className="system-status">
          System Status <strong>Operational</strong>
          <span />
        </div>
      </div>
      <div className="portal-stats four">
        <Metric title="Active Users" value="1,284" />
        <Metric title="Pending Apps" value={String(pendingCount)} accent />
        <Metric title="Total Trails" value="82" />
        <Metric title="Alerts" value="3" danger />
      </div>
      <div className="admin-tabs">
        <button className="active">Organizer Applications</button>
        <button>User Registry</button>
        <button>Trail Inventory</button>
      </div>
      <div className="admin-table">
        <div className="admin-row head">
          <span>ID/Entity</span>
          <span>Email</span>
          <span>Status</span>
          <span>Reason</span>
          <span>Actions</span>
        </div>
        {rows.map((application) => (
          <div className="admin-row" key={application.id}>
            <span>
              <small>{application.id}</small>
              <strong>{application.name}</strong>
            </span>
            <span className="mono large">{application.email}</span>
            <span>
              <b
                className={application.status === 'approved' ? 'status approved' : 'status pending'}
              >
                {application.status}
              </b>
            </span>
            <span>
              <strong>{application.reason}</strong>
            </span>
            <span className="row-actions">
              <button
                type="button"
                disabled={application.status === 'approved'}
                onClick={() => approveOrganizer(application.id)}
              >
                Approve
              </button>
              <button type="button">Decline</button>
            </span>
          </div>
        ))}
      </div>
    </PortalShell>
  )
}
