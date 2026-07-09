import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { OverlayTrail, PostPreview, Section } from '../components/Cards'
import { IMG, communityPosts, homeEvents, trails } from '../data/mockData'
import { bgStyle } from '../utils/style'

export default function HomePage() {
  return (
    <main>
      <section className="home-hero photo-hero" style={bgStyle(IMG.hero)}>
        <div className="hero-search">
          <p className="hero-light">Discover your next</p>
          <h1>Mandalay Trek</h1>
          <form className="search-panel" onSubmit={(event) => event.preventDefault()}>
            <label>
              <span className="material-symbols-outlined">search</span>
              <input placeholder="Search trail names..." />
            </label>
            <select defaultValue="">
              <option value="" disabled>
                Difficulty
              </option>
              <option>Easy</option>
              <option>Moderate</option>
              <option>Hard</option>
            </select>
            <select defaultValue="">
              <option value="" disabled>
                Distance
              </option>
              <option>Under 5 km</option>
              <option>5-10 km</option>
              <option>10 km+</option>
            </select>
            <Link className="button cta" to="/trails">
              Explore
            </Link>
          </form>
        </div>
      </section>
      <Section title="Popular Trails" action="See all ->" actionTo="/trails">
        <div className="overlay-grid">
          {trails.slice(0, 3).map((trail) => (
            <OverlayTrail key={trail.id} trail={trail} />
          ))}
        </div>
      </Section>
      <section className="surface-section">
        <Section title="Upcoming Events" action="Full calendar ->" actionTo="/events" flush>
          <div className="event-teasers">
            {homeEvents.map(([title, text, date, icon]) => (
              <article className="event-teaser" key={title}>
                <span className="icon-chip material-symbols-outlined">{icon}</span>
                <p className="mono">{date}</p>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link className="button outline wide" to="/events">
                  Join Hike
                </Link>
              </article>
            ))}
          </div>
        </Section>
      </section>
      <Section title="From the Community" action="Explore forum ->" actionTo="/community">
        <div className="community-grid">
          {communityPosts.map(([handle, title, likes, image]) => (
            <PostPreview key={title} handle={handle} title={title} likes={likes} image={image} />
          ))}
        </div>
      </Section>
      <Footer />
    </main>
  )
}
