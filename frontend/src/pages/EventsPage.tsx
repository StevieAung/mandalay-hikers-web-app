import { Link } from 'react-router-dom'
import { EventListingCard } from '../components/Cards'
import { Footer } from '../components/Footer'
import { events } from '../data/mockData'
import { useAuth } from '../context/useAuth'

export default function EventsPage() {
  const { user } = useAuth()
  const createPath = user ? '/organizer/events/new' : '/login'

  return (
    <main>
      <section className="events-page">
        <div className="events-head">
          <div className="stacked-heading small">
            <span>Mandalay Trek</span>
            <strong>Seasonal Expeditions</strong>
            <p>
              Coordinate with local trekkers for upcoming expeditions across the Shan Hills and the
              Ayeyarwady plains. Reliability is our terrain.
            </p>
          </div>
          <Link className="button cta" to={createPath}>
            <span className="material-symbols-outlined">add</span>Create Event
          </Link>
        </div>
        <div className="events-grid">
          <Link className="featured-event" to="/events/yankin-dawn">
            <img src={events[0].image} alt={events[0].title} />
            <div>
              <span className="badge dark-badge">{events[0].status}</span>
              <span className="badge pale">Advanced</span>
              <p className="mono">
                {events[0].date} - {events[0].time}
              </p>
              <h2>{events[0].title}</h2>
              <p>{events[0].text}</p>
            </div>
          </Link>
          {events.slice(1).map((event) => (
            <EventListingCard key={event.id} event={event} />
          ))}
          <article className="lead-card">
            <span className="material-symbols-outlined">group_add</span>
            <h3>Want to lead a trek?</h3>
            <p>
              Explorers can apply to become verified organizers. Admin approval unlocks event
              creation.
            </p>
            <Link to={user ? '/organizer/apply' : '/login'}>
              {user ? 'Apply to organize' : 'Sign in to organize'}
            </Link>
          </article>
        </div>
        <section className="safety-band">
          <div>
            <p className="hero-light">Safety is our</p>
            <h2>Base Camp</h2>
            <p>
              Every event on Hikers is vetted for guide certifications and real-time weather
              monitoring. No one treks alone.
            </p>
            <button className="button cta" type="button">
              Read Guidelines
            </button>
          </div>
          <div className="contour-lines" aria-hidden="true" />
        </section>
      </section>
      <Footer />
    </main>
  )
}
