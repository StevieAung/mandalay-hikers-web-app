import { useEffect, useState } from 'react'
import { Footer } from '../components/Footer'
import { TrailListingCard } from '../components/Cards'
import { useLocale } from '../context/useLocale'
import type { ApiTrail, PaginatedResponse } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'

export default function TrailDiscoveryPage() {
  const { t } = useLocale()
  const [trails, setTrails] = useState<ApiTrail[]>([])
  const [difficulty, setDifficulty] = useState('Moderate')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTrails = async () => {
      try {
        const response = await apiRequest<PaginatedResponse<ApiTrail>>('/api/trails')
        setTrails(response.data)
        setError(null)
      } catch (requestError) {
        setError(requestError instanceof ApiError ? requestError.message : t('trails.loadError'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadTrails()
  }, [t])

  const filtered =
    difficulty === 'All' ? trails : trails.filter((trail) => trail.difficulty === difficulty)

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
              <button type="button" onClick={() => setDifficulty('All')}>
                {t('trails.reset')}
              </button>
            </div>
            <label className="check-row">
              <input
                type="checkbox"
                checked={difficulty === 'Easy'}
                onChange={() => setDifficulty('Easy')}
              />
              Easy
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={difficulty === 'Moderate'}
                onChange={() => setDifficulty('Moderate')}
              />
              Moderate
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={difficulty === 'Hard'}
                onChange={() => setDifficulty('Hard')}
              />
              Hard
            </label>
            <label className="range-label">
              Distance (km)
              <input type="range" defaultValue="50" />
            </label>
            <div className="range-foot">
              <span>0km</span>
              <span>50km+</span>
            </div>
            <p className="filter-label">{t('trails.duration')}</p>
            <div className="duration-grid">
              {['Short (<3h)', 'Half Day', 'Full Day', 'Multi-day'].map((item) => (
                <button className={item === 'Half Day' ? 'active' : ''} type="button" key={item}>
                  {item}
                </button>
              ))}
            </div>
            <label className="select-label">
              {t('trails.season')}
              <select>
                <option>{t('trails.allSeasons')}</option>
                <option>{t('trails.dry')}</option>
              </select>
            </label>
            <button className="button cta wide" type="button">
              {t('trails.update')}
            </button>
          </aside>
          <div className="trail-card-grid">
            {isLoading && <p className="table-empty">{t('trails.loading')}</p>}
            {error && <p className="table-empty danger">{error}</p>}
            {!isLoading && !error && !filtered.length && (
              <p className="table-empty">{t('trails.empty')}</p>
            )}
            {filtered.map((trail) => (
              <TrailListingCard key={trail.id} trail={trail} />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
