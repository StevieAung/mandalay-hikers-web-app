import { useState } from 'react'
import { Footer } from '../components/Footer'
import { TrailListingCard } from '../components/Cards'
import { trails } from '../data/mockData'

export default function TrailDiscoveryPage() {
  const [difficulty, setDifficulty] = useState('Moderate')
  const filtered =
    difficulty === 'All' ? trails : trails.filter((trail) => trail.difficulty === difficulty)
  const visible = filtered.length ? filtered : trails

  return (
    <main>
      <section className="listing-page">
        <div className="stacked-heading">
          <span>Discover the Rugged</span>
          <strong>Mandalay Trails</strong>
        </div>
        <div className="discovery-layout">
          <aside className="filter-rail">
            <div className="filter-title">
              <span>Refine Results</span>
              <button type="button" onClick={() => setDifficulty('All')}>
                Reset All
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
            <p className="filter-label">Duration</p>
            <div className="duration-grid">
              {['Short (<3h)', 'Half Day', 'Full Day', 'Multi-day'].map((item) => (
                <button className={item === 'Half Day' ? 'active' : ''} type="button" key={item}>
                  {item}
                </button>
              ))}
            </div>
            <label className="select-label">
              Best Season
              <select>
                <option>All Seasons</option>
                <option>Dry Season</option>
              </select>
            </label>
            <button className="button cta wide" type="button">
              Update Results
            </button>
          </aside>
          <div className="trail-card-grid">
            {visible.map((trail) => (
              <TrailListingCard key={trail.id} trail={trail} />
            ))}
          </div>
        </div>
        <button className="load-more" type="button">
          <span className="material-symbols-outlined">refresh</span>Load More Trails
        </button>
      </section>
      <Footer />
    </main>
  )
}
