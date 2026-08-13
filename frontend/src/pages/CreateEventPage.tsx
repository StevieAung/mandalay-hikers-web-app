import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Field } from '../components/FormField'
import { PortalShell } from '../components/Portal'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import type { ApiEvent, ApiTrail, PaginatedResponse } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'

const emptyForm = {
  title: '',
  destination: '',
  meeting_point: '',
  date: '',
  time: '',
  participant_limit: '12',
  required_equipment: '',
  description: '',
  trail_id: '',
}

export default function CreateEventPage() {
  const navigate = useNavigate()
  const { authToken } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState(emptyForm)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [trails, setTrails] = useState<ApiTrail[]>([])
  const [isLoadingTrails, setIsLoadingTrails] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTrails = async () => {
      try {
        const response = await apiRequest<PaginatedResponse<ApiTrail>>('/api/trails?per_page=100')
        setTrails(response.data)
      } catch {
        setTrails([])
      } finally {
        setIsLoadingTrails(false)
      }
    }

    void loadTrails()
  }, [])

  const setValue = (key: keyof typeof emptyForm) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  const selectTrail = (trailId: string) => {
    const trail = trails.find((item) => String(item.id) === trailId)
    setForm((current) => ({
      ...current,
      destination: trail?.location || '',
      trail_id: trailId,
    }))
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.trail_id) {
      setError('Choose a trail from the database before creating this event.')
      return
    }

    if (!form.date || !form.time) {
      setError('Pick both a date and a start time for the event.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const payload = new FormData()
    payload.append('title', form.title)
    payload.append('destination', form.destination)
    payload.append('meeting_point', form.meeting_point)
    payload.append('starts_at', `${form.date} ${form.time}:00`)
    payload.append('participant_limit', form.participant_limit)
    payload.append('description', form.description)

    if (form.required_equipment) payload.append('required_equipment', form.required_equipment)
    payload.append('trail_id', form.trail_id)
    if (coverImage) payload.append('cover_image', coverImage)

    try {
      const created = await apiRequest<ApiEvent>('/api/events', {
        body: payload,
        method: 'POST',
        token: authToken,
      })
      showToast({
        message: `${created.title} is now listed on the events page.`,
        title: 'Event created',
        variant: 'success',
      })
      navigate('/organizer-dashboard')
    } catch (requestError) {
      const message =
        requestError instanceof ApiError ? requestError.message : 'Could not create this event.'
      setError(message)
      showToast({ message, title: 'Event not created', variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PortalShell active="organizer">
      <div className="admin-compact-head">
        <div>
          <h1>Create New Event</h1>
        </div>
        <button
          className="button outline"
          onClick={() => navigate('/organizer-dashboard')}
          type="button"
        >
          Back to overview
        </button>
      </div>
      <form className="create-form organizer-event-form admin-table-card" onSubmit={submit}>
        <div className="organizer-form-intro">
          <span className="label orange-text">Event details</span>
          <p>Set the route, meeting details, capacity, and safety information for your hikers.</p>
        </div>
        <Field
          label="Event Name"
          required
          value={form.title}
          onChange={setValue('title')}
          placeholder="Dawn over Yankin Hill"
        />
        <label className="form-field">
          <span>Trail</span>
          <select
            disabled={isLoadingTrails || !trails.length}
            required
            value={form.trail_id}
            onChange={(event) => selectTrail(event.target.value)}
          >
            <option value="">
              {isLoadingTrails ? 'Loading trails...' : trails.length ? 'Select a trail' : 'No trails available'}
            </option>
            {trails.map((trail) => (
              <option key={trail.id} value={trail.id}>
                {trail.name} — {trail.location}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Destination"
          required
          readOnly
          value={form.destination}
          onChange={setValue('destination')}
          placeholder="Select a trail to set the destination"
        />
        <Field
          label="Meeting Point"
          required
          value={form.meeting_point}
          onChange={setValue('meeting_point')}
          placeholder="South entrance pagoda"
        />
        <div className="form-grid">
          <Field label="Date" type="date" required value={form.date} onChange={setValue('date')} />
          <Field label="Time" type="time" required value={form.time} onChange={setValue('time')} />
        </div>
        <div className="form-grid">
          <Field
            label="Participant Limit"
            type="number"
            min={1}
            required
            value={form.participant_limit}
            onChange={setValue('participant_limit')}
          />
        </div>
        <label className="form-field">
          <span>Required Equipment</span>
          <textarea
            value={form.required_equipment}
            onChange={(event) => setValue('required_equipment')(event.target.value)}
            placeholder="Headlamp, grip shoes, 1.5L water"
          />
        </label>
        <label className="form-field">
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={(event) => setValue('description')(event.target.value)}
            placeholder="Route notes, safety requirements, equipment list..."
            required
          />
        </label>
        <label className="form-field">
          <span>Cover Image</span>
          <input
            accept="image/*"
            type="file"
            onChange={(event) => setCoverImage(event.target.files?.[0] ?? null)}
          />
        </label>
        {error && <p className="table-empty danger">{error}</p>}
        <button className="button cta" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving...' : 'Save Event'}
        </button>
      </form>
    </PortalShell>
  )
}
