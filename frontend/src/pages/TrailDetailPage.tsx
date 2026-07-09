import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { DividerTitle, Review, Stat } from '../components/Cards'
import { Footer } from '../components/Footer'
import { IMG, trails } from '../data/mockData'
import { bgStyle } from '../utils/style'

export default function TrailDetailPage() {
  const { id } = useParams()
  const trail = trails.find((item) => item.id === id) || trails[0]
  const [saved, setSaved] = useState(false)

  return (
    <main>
      <section className="detail-hero photo-hero" style={bgStyle(IMG.detailHero)}>
        <div>
          <span className="badge orange">Difficulty: Moderate</span>
          <p className="hero-light">Mandalay Region</p>
          <h1>{trail.name.replace('Path', 'Trail')}</h1>
        </div>
        <div className="hero-buttons">
          <button className="button cta" type="button" onClick={() => setSaved(!saved)}>
            <span className="material-symbols-outlined">bookmark</span>
            {saved ? 'Saved' : 'Save Trail'}
          </button>
          <button className="button dark" type="button">
            <span className="material-symbols-outlined">report</span>Report
          </button>
        </div>
      </section>
      <section className="detail-content">
        <div className="detail-main">
          <p className="detail-copy">
            The Yankin Hill Ridge Trail is a favorite among local Mandalay trekkers, offering a
            perfect blend of spiritual heritage and physical challenge. The trail snakes along the
            limestone spine of Yankin Hill, passing meditation retreats and ancient pagodas.
          </p>
          <div className="stats-grid">
            {[
              ['Distance', '6.42 KM'],
              ['Elevation Gain', '320 M'],
              ['Est. Time', '2H 15M'],
              ['Trail Type', 'Out & Back'],
              ['Max Altitude', '412 M'],
              ['Water Sources', 'None'],
            ].map(([label, value]) => (
              <Stat key={label} label={label} value={value} />
            ))}
          </div>
          <DividerTitle title="Coordinates" />
          <div className="map-frame">
            <img src={IMG.detailMap} alt="Topographic map of Yankin Hill" />
            <span>21.9833 N, 96.1667 E</span>
          </div>
        </div>
        <aside className="detail-side">
          <DividerTitle title="Trail Gallery" />
          <div className="gallery-grid">
            <img src={IMG.detailGallery1} alt="Limestone trail" />
            <img src={IMG.detailGallery2} alt="Stupa ridge" />
            <img src={IMG.detailGallery3} alt="Mandalay valley" />
          </div>
          <div className="rating-panel">
            <p className="label">Community Rating</p>
            <div className="rating-line">
              <strong>4.8</strong>
              <span>☆☆☆☆☆</span>
              <small>128 reviews</small>
            </div>
            <Review
              name="Kyaw Z."
              date="Oct 24"
              text="The final ridge scramble is demanding but the views are unmatched in Mandalay."
            />
            <Review
              name="Ma S."
              date="Oct 12"
              text="Perfect for a sunrise hike. The trail is well-maintained but rocky."
            />
            <button className="button outline wide" type="button">
              Write a Review
            </button>
          </div>
        </aside>
      </section>
      <Footer />
    </main>
  )
}
