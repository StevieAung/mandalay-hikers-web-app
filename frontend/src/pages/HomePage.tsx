import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { OverlayTrail, PostPreview, Section } from '../components/Cards'
import { IMG } from '../data/mockData'
import { bgStyle } from '../utils/style'
import { useLocalizedContent } from '../data/useLocalizedContent'
import { useLocale } from '../context/useLocale'

export default function HomePage() {
  const { t } = useLocale()
  const { trails, homeEvents, communityPosts } = useLocalizedContent()
  return (
    <main>
      <section className="home-hero photo-hero" style={bgStyle(IMG.hero)}>
        <div className="hero-search">
          <p className="hero-light">{t('home.discover')}</p>
          <h1>{t('home.trek')}</h1>
          <form className="search-panel" onSubmit={(event) => event.preventDefault()}>
            <label>
              <span className="material-symbols-outlined">search</span>
              <input placeholder={t('home.search')} />
            </label>
            <select defaultValue="">
              <option value="" disabled>
                {t('home.difficulty')}
              </option>
              <option>Easy</option>
              <option>Moderate</option>
              <option>Hard</option>
            </select>
            <select defaultValue="">
              <option value="" disabled>
                {t('home.distance')}
              </option>
              <option>Under 5 km</option>
              <option>5-10 km</option>
              <option>10 km+</option>
            </select>
            <Link className="button cta" to="/trails">
              {t('home.explore')}
            </Link>
          </form>
        </div>
      </section>
      <Section title={t('home.popular')} action={t('home.seeAll')} actionTo="/trails">
        <div className="overlay-grid">
          {trails.slice(0, 3).map((trail) => (
            <OverlayTrail key={trail.id} trail={trail} />
          ))}
        </div>
      </Section>
      <section className="surface-section">
        <Section title={t('home.upcoming')} action={t('home.calendar')} actionTo="/events" flush>
          <div className="event-teasers">
            {homeEvents.map(([title, text, date, icon]) => (
              <article className="event-teaser" key={title}>
                <span className="icon-chip material-symbols-outlined">{icon}</span>
                <p className="mono">{date}</p>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link className="button outline wide" to="/events">
                  {t('home.join')}
                </Link>
              </article>
            ))}
          </div>
        </Section>
      </section>
      <Section title={t('home.community')} action={t('home.forum')} actionTo="/community">
        <div className="community-grid">
          {communityPosts.map((post) => (
            <PostPreview key={post.id} post={post} />
          ))}
        </div>
      </Section>
      <Footer />
    </main>
  )
}
