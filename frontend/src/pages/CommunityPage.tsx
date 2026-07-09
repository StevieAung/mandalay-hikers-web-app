import { useState } from 'react'
import { Footer } from '../components/Footer'
import { communityPosts } from '../data/mockData'

export default function CommunityPage() {
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  return (
    <main>
      <section className="community-page">
        <div className="stacked-heading small">
          <span>Field Notes</span>
          <strong>Community Dispatches</strong>
          <p>
            Trip reports, gear advice, route questions, and local hiking knowledge from Mandalay
            trekkers.
          </p>
        </div>
        <div className="community-board">
          <form className="dispatch-form" onSubmit={(event) => event.preventDefault()}>
            <h2>Share a trail note</h2>
            <input placeholder="Subject" />
            <textarea placeholder="What should other hikers know?" />
            <button className="button cta wide" type="submit">
              Publish Dispatch
            </button>
          </form>
          <div className="dispatch-list">
            {communityPosts.map(([handle, title, likes, image]) => (
              <article className="dispatch-card" key={title}>
                <img src={image} alt={title} />
                <div>
                  <span className="label">{handle}</span>
                  <h3>{title}</h3>
                  <p>
                    Practical field notes from recent Mandalay hikes, focused on terrain, safety,
                    and timing.
                  </p>
                  <button
                    type="button"
                    onClick={() => setLiked({ ...liked, [title]: !liked[title] })}
                  >
                    {liked[title] ? 'Saved' : likes}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
