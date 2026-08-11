import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { TrailListingCard } from '../components/Cards'
import { useLocale } from '../context/useLocale'
import type { ApiTrail, PaginatedResponse } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'

const DIFFICULTIES = ['Easy', 'Moderate', 'Hard']

export default function TrailDiscoveryPage() {
  const { t } = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const [trails, setTrails] = useState<ApiTrail[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const activeSearch = searchParams.get('search') || ''
  const activeDifficulty = searchParams.get('difficulty') || ''
  const [searchDraft, setSearchDraft] = useState(activeSearch)

  useEffect(() => {
    const params = new URLSearchParams()
    if (activeSearch) params.set('search', activeSearch)
    if (activeDifficulty) params.set('difficulty', activeDifficulty)
    const query = params.toString()

    const loadTrails = async () => {
      setIsLoading(true)
      try {
        const response = await apiRequest<PaginatedResponse<ApiTrail>>(
          query ? `/api/trails?${query}` : '/api/trails',
        )
        setTrails(response.data)
        setError(null)
      } catch (requestError) {
        setError(requestError instanceof ApiError ? requestError.message : t('trails.loadError'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadTrails()
  }, [activeDifficulty, activeSearch, t])

  const applyFilters = (next: { difficulty?: string; search?: string }) => {
    const params = new URLSearchParams()
    const search = next.search ?? activeSearch
    const difficulty = next.difficulty ?? activeDifficulty
    if (search) params.set('search', search)
    if (difficulty) params.set('difficulty', difficulty)
    setSearchParams(params)
  }

  return (
    <main>
      <section className="listing-page">
        <div className="stacked-heading">
          <span>{t('trails.heading')}</span>
          <strong>{t('trails.title')}</strong>
        </div>
        <div className="discovery-layout">
          <aside className="filter-rail">
            <div className="filter-title">
              <span>{t('trails.refine')}</span>
              <button
                type="button"
                onClick={() => {
                  setSearchDraft('')
                  setSearchParams(new URLSearchParams())
                }}
              >
                {t('trails.reset')}
              </button>
            </div>
            <label className="select-label">
              {t('home.search')}
              <input
                onChange={(event) => setSearchDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applyFilters({ search: searchDraft.trim() })
                }}
                placeholder="Mandalay Hill, Dee Dote..."
                value={searchDraft}
              />
            </label>
            {DIFFICULTIES.map((level) => (
              <label className="check-row" key={level}>
                <input
                  type="checkbox"
                  checked={activeDifficulty === level}
                  onChange={() =>
                    applyFilters({ difficulty: activeDifficulty === level ? '' : level })
                  }
                />
                {level}
              </label>
            ))}
            <button
              className="button cta wide"
              type="button"
              onClick={() => applyFilters({ search: searchDraft.trim() })}
            >
              {t('trails.update')}
            </button>
          </aside>
          <div className="trail-card-grid">
            {isLoading && <p className="table-empty">{t('trails.loading')}</p>}
            {error && <p className="table-empty danger">{error}</p>}
            {!isLoading && !error && !trails.length && (
              <p className="table-empty">{t('trails.empty')}</p>
            )}
            {!isLoading &&
              !error &&
              trails.map((trail) => <TrailListingCard key={trail.id} trail={trail} />)}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
