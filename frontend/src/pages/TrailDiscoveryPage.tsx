import { useState } from 'react'
import { Footer } from '../components/Footer'
import { TrailListingCard } from '../components/Cards'
import { useLocalizedContent } from '../data/useLocalizedContent'
import { useLocale } from '../context/useLocale'

export default function TrailDiscoveryPage() {
  const { t } = useLocale()
  const { trails } = useLocalizedContent()
  const [difficulty, setDifficulty] = useState('Moderate')
  const filtered =
    difficulty === 'All'
      ? trails
      : trails.filter((trail) => (trail.difficultyKey ?? trail.difficulty) === difficulty)
  const visible = filtered.length ? filtered : trails

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
            {visible.map((trail) => (
              <TrailListingCard key={trail.id} trail={trail} />
            ))}
          </div>
        </div>
        <button className="load-more" type="button">
          <span className="material-symbols-outlined">refresh</span>
          {t('trails.load')}
        </button>
      </section>
      <Footer />
    </main>
  )
}
