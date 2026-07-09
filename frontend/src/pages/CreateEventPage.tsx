import { useNavigate } from 'react-router-dom'
import { Field } from '../components/FormField'
import { PortalShell } from '../components/Portal'

export default function CreateEventPage() {
  const navigate = useNavigate()

  return (
    <PortalShell active="organizer">
      <div className="portal-title-row">
        <div>
          <span className="label orange-text">Organizer</span>
          <h1>Create New Event</h1>
        </div>
      </div>
      <form
        className="create-form"
        onSubmit={(event) => {
          event.preventDefault()
          navigate('/organizer')
        }}
      >
        <Field
          label="Event Name"
          value=""
          onChange={() => null}
          placeholder="Dawn over Yankin Hill"
        />
        <Field label="Destination" value="" onChange={() => null} placeholder="Yankin Hill Ridge" />
        <Field
          label="Meeting Point"
          value=""
          onChange={() => null}
          placeholder="South entrance pagoda"
        />
        <div className="form-grid">
          <Field label="Date" type="date" value="" onChange={() => null} />
          <Field label="Time" type="time" value="" onChange={() => null} />
        </div>
        <label className="form-field">
          <span>Description</span>
          <textarea placeholder="Route notes, safety requirements, equipment list..." />
        </label>
        <button className="button cta" type="submit">
          Save Event
        </button>
      </form>
    </PortalShell>
  )
}
