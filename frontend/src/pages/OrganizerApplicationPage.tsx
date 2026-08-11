import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Field } from '../components/FormField'
import { PortalShell } from '../components/Portal'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import type { ApiOrganizerApplication, ProfilePayload } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'

const MIN_REASON_LENGTH = 20

export default function OrganizerApplicationPage() {
  const { authToken, user } = useAuth()
  const { showToast } = useToast()
  const [reason, setReason] = useState('')
  const [application, setApplication] = useState<ApiOrganizerApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!authToken) return

    const loadApplication = async () => {
      try {
        const response = await apiRequest<ProfilePayload>('/api/me/dashboard', { token: authToken })
        setApplication(response.latest_organizer_application ?? null)
      } catch {
        setApplication(null)
      } finally {
        setIsLoading(false)
      }
    }

    void loadApplication()
  }, [authToken])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = reason.trim()

    if (trimmed.length < MIN_REASON_LENGTH) {
      setFormError(`Please write at least ${MIN_REASON_LENGTH} characters about your experience.`)
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      const created = await apiRequest<ApiOrganizerApplication>('/api/organizer-applications', {
        body: JSON.stringify({ reason: trimmed }),
        method: 'POST',
        token: authToken,
      })
      setApplication(created)
      setReason('')
      showToast({
        message: 'An admin will review your request and update your role once approved.',
        title: 'Application submitted',
        variant: 'success',
      })
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : 'Could not submit your application.'
      setFormError(message)
      showToast({ message, title: 'Application not sent', variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingOrApproved = application?.status === 'pending' || application?.status === 'approved'

  return (
    <PortalShell active={user?.role === 'organizer' ? 'organizer' : 'explorer'}>
      <div className="portal-title-row">
        <div>
          <span className="label orange-text">Explorer Path</span>
          <h1>Organizer Application</h1>
          <p>Explorers submit a request first. Approval changes the account role to organizer.</p>
        </div>
      </div>
      {user?.role !== 'explorer' ? (
        <article className="dark-callout">
          <h2>
            {user?.role === 'organizer'
              ? 'You are already an organizer.'
              : 'Application unavailable.'}
          </h2>
          <p>Use the correct dashboard for your role to continue managing the platform.</p>
          <Link className="button cta" to="/organizer-dashboard">
            Open Dashboard
          </Link>
        </article>
      ) : isLoading ? (
        <p className="table-empty">Checking your application status...</p>
      ) : pendingOrApproved ? (
        <article className="dark-callout">
          <h2>Application {application?.status}</h2>
          <p>{application?.reason}</p>
          {application?.review_note && <p>Reviewer note: {application.review_note}</p>}
          <Link className="button cta" to="/explorer-dashboard">
            Back to Explorer Dashboard
          </Link>
        </article>
      ) : (
        <form className="create-form" onSubmit={submit}>
          {application?.status === 'rejected' && (
            <article className="dark-callout">
              <h2>Your last application was rejected</h2>
              <p>{application.review_note || 'You can submit an updated application below.'}</p>
            </article>
          )}
          <Field label="Applicant" readOnly value={user?.name || ''} onChange={() => null} />
          <label className="form-field">
            <span>Why do you want to organize hikes?</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Share your hiking experience, safety approach, and the kinds of Mandalay events you want to lead."
            />
          </label>
          {formError && <p className="table-empty danger">{formError}</p>}
          <button className="button cta" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      )}
    </PortalShell>
  )
}
