import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Field } from '../components/FormField'
import { PortalShell } from '../components/Portal'
import { useAuth } from '../context/useAuth'

export default function OrganizerApplicationPage() {
  const { user, applications, applyForOrganizer } = useAuth()
  const [reason, setReason] = useState('')
  const application = applications.find((item) => item.email === user?.email)

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    applyForOrganizer(
      reason || 'I want to organize safe and beginner-friendly Mandalay hiking events.',
    )
  }

  return (
    <PortalShell
      active={
        user?.role === 'admin' ? 'admin' : user?.role === 'organizer' ? 'organizer' : 'explorer'
      }
    >
      <div className="portal-title-row">
        <div>
          <span className="label orange-text">Explorer Path</span>
          <h1>Organizer Application</h1>
          <p>
            Explorers submit a request first. Admin approval changes the account role to organizer.
          </p>
        </div>
      </div>
      {user?.role !== 'explorer' ? (
        <article className="dark-callout">
          <h2>
            {user?.role === 'organizer'
              ? 'You are already an organizer.'
              : 'Admin accounts can approve organizers.'}
          </h2>
          <p>Use the correct dashboard for your role to continue managing the platform.</p>
          <Link className="button cta" to={user?.role === 'admin' ? '/admin' : '/organizer'}>
            Open Dashboard
          </Link>
        </article>
      ) : application ? (
        <article className="dark-callout">
          <h2>Application {application.status}</h2>
          <p>{application.reason}</p>
          <Link className="button cta" to="/dashboard">
            Back to Explorer Dashboard
          </Link>
        </article>
      ) : (
        <form className="create-form" onSubmit={submit}>
          <Field label="Applicant" value={user?.name || ''} onChange={() => null} />
          <label className="form-field">
            <span>Why do you want to organize hikes?</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Share your hiking experience, safety approach, and the kinds of Mandalay events you want to lead."
            />
          </label>
          <button className="button cta" type="submit">
            Submit Application
          </button>
        </form>
      )}
    </PortalShell>
  )
}
