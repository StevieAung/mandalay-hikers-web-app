import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthPage from './AuthPage'
import { Footer } from '../components/Footer'
import { OverlayTrail, PostPreview, Section } from '../components/Cards'
import { IMG } from '../data/mockData'
import { bgStyle } from '../utils/style'
import { useLocale } from '../context/useLocale'
import type { ApiEvent, ApiPost, ApiTrail, PaginatedResponse } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'
import { formatDate, formatTime } from '../utils/format'

const PREVIEW_COUNT = 3

export default function HomePage() {
  const navigate = useNavigate()
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const { t } = useLocale()
  const [trails, setTrails] = useState<ApiTrail[]>([])
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')

  useEffect(() => {
    const loadHighlights = async () => {
      try {
        const [trailsResponse, eventsResponse, postsResponse] = await Promise.all([
          apiRequest<PaginatedResponse<ApiTrail>>('/api/trails'),
          apiRequest<PaginatedResponse<ApiEvent>>('/api/events?status=upcoming'),
          apiRequest<PaginatedResponse<ApiPost>>('/api/posts'),
        ])
        setTrails(trailsResponse.data.slice(0, PREVIEW_COUNT))
        setEvents(eventsResponse.data.slice(0, PREVIEW_COUNT))
        setPosts(postsResponse.data.slice(0, PREVIEW_COUNT))
        setLoadError(null)
      } catch (requestError) {
        setLoadError(
          requestError instanceof ApiError ? requestError.message : t('trails.loadError'),
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadHighlights()
  }, [t])

  const runSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (difficulty) params.set('difficulty', difficulty)
    navigate(params.toString() ? `/trails?${params}` : '/trails')
  }

  return (
    <main>
      <section className="home-hero photo-hero" style={bgStyle(IMG.hero)}>
        <div className="hero-search">
          <p className="hero-light">{t('home.discover')}</p>
          <h1>{t('home.trek')}</h1>
          <form className="search-panel" onSubmit={runSearch}>
            <label>
              <span className="material-symbols-outlined">search</span>
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('home.search')}
                value={search}
              />
            </label>
            <select onChange={(event) => setDifficulty(event.target.value)} value={difficulty}>
              <option value="">{t('home.difficulty')}</option>
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Hard">Hard</option>
            </select>
            <button className="button cta" type="submit">
              {t('home.explore')}
            </button>
          </form>
          <div className="hero-auth-actions">
            <button
              className="button outline light-button"
              onClick={() => setAuthMode('login')}
              type="button"
            >
              Sign in
            </button>
            <button className="button cta" onClick={() => setAuthMode('register')} type="button">
              Create account
            </button>
          </div>
        </div>
      </section>
      <Section title={t('home.popular')} action={t('home.seeAll')} actionTo="/trails">
        <div className="overlay-grid">
          {isLoading && <p className="table-empty">{t('trails.loading')}</p>}
          {loadError && <p className="table-empty danger">{loadError}</p>}
          {!isLoading &&
            !loadError &&
            trails.map((trail) => <OverlayTrail key={trail.id} trail={trail} />)}
        </div>
      </Section>
      <section className="surface-section">
        <Section title={t('home.upcoming')} action={t('home.calendar')} actionTo="/events" flush>
          <div className="event-teasers">
            {!isLoading && !loadError && !events.length && (
              <p className="table-empty">No upcoming events are scheduled.</p>
            )}
            {events.map((event) => (
              <article className="event-teaser" key={event.id}>
                <span className="icon-chip material-symbols-outlined">hiking</span>
                <p className="mono">
                  {formatDate(event.starts_at)} - {formatTime(event.starts_at)}
                </p>
                <h3>{event.title}</h3>
                <p>{event.description || event.destination}</p>
                <Link className="button outline wide" to={`/events/${event.id}`}>
                  {t('home.join')}
                </Link>
              </article>
            ))}
          </div>
        </Section>
      </section>
      <Section title={t('home.community')} action={t('home.forum')} actionTo="/community">
        <div className="community-grid">
          {!isLoading && !loadError && !posts.length && (
            <p className="table-empty">No community posts yet.</p>
          )}
          {posts.map((post) => (
            <PostPreview key={post.id} post={post} />
          ))}
        </div>
      </Section>
      <Footer />
      {authMode && (
        <AuthPage
          mode={authMode}
          modal
          onClose={() => setAuthMode(null)}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        />
      )}
    </main>
  )
}
