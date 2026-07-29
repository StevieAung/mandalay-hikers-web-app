import { useState } from 'react'
import { Link } from 'react-router-dom'
import ShieldCheck from 'reicon-react/icons/ShieldCheck'
import { Panel, Stat } from '../components/Cards'
import { Footer } from '../components/Footer'
import { IMG } from '../data/mockData'
import { bgStyle } from '../utils/style'
import { useLocale } from '../context/useLocale'

export default function EventDetailPage() {
  const { t } = useLocale()
  const [joined, setJoined] = useState(false)

  return (
    <main>
      <section className="event-detail-hero photo-hero" style={bgStyle(IMG.eventHero)}>
        <p className="hero-light">{t('event.featured')}</p>
        <h1>Yankin Hill Dawn Expedition</h1>
      </section>
      <section className="event-detail-layout">
        <div className="event-main">
          <div className="event-facts">
            {[
              ['Date', 'Dec 14, 2024'],
              ['Time', '04:30 AM'],
              ['Difficulty', 'Moderate'],
              ['Duration', '4 Hours'],
            ].map(([label, value]) => (
              <Stat key={label} label={label} value={value} />
            ))}
          </div>
          <div className="organizer-strip">
            <img src={IMG.guide} alt="Organizer" />
            <Link to="/organizers/mandalay-treks">
              <span>Organizer</span>
              <strong>Thurein Lynn</strong>
            </Link>
            <p>
              <ShieldCheck size={20} weight="Filled" />
              Expert Navigator
            </p>
          </div>
          <h2 className="section-title">{t('event.overview')}</h2>
          <p className="detail-copy">{t('event.copy')}</p>
          <div className="requirement-grid">
            <Panel
              title={t('event.safetyRequirements')}
              items={[
                'Physical fitness for 250m elevation gain',
                'Familiarity with rocky terrain',
                'Hydration readiness (min. 1.5L water)',
              ]}
            />
            <Panel
              title={t('event.equipment')}
              items={[
                'Headlamp with extra batteries',
                'High-traction trekking shoes',
                'Light windbreaker (dawn chill)',
              ]}
            />
          </div>
          <div className="meeting-map">
            <img src={IMG.detailMap} alt="Meeting point map" />
            <div>
              <span>{t('event.meeting')}</span>
              <strong>Yankin Hill South Entrance Pagoda</strong>
            </div>
          </div>
        </div>
        <aside className="join-panel">
          <span>{t('event.cost')}</span>
          <strong>
            25,000 <small>MMK</small>
          </strong>
          <button className="button cta wide" type="button" onClick={() => setJoined(!joined)}>
            {joined ? t('event.joined') : t('event.join')}
          </button>
          <button className="button outline wide" type="button">
            {t('event.save')}
          </button>
          <p>"Limited to 12 participants for coordination safety. 8 slots remaining."</p>
          <div className="avatar-row">
            <span />
            <span />
            <b>+4</b>
          </div>
        </aside>
      </section>
      <Footer />
    </main>
  )
}
