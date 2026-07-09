import { useState } from 'react'
import { Link } from 'react-router-dom'
import MessageDots from 'reicon-react/icons/MessageDots'
import ShieldCheck from 'reicon-react/icons/ShieldCheck'
import User from 'reicon-react/icons/User'
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
            {communityPosts.map((post) => {
              const isOrganizer = post.authorId === 'mandalay-treks'
              const authorPath = isOrganizer
                ? `/organizers/${post.authorId}`
                : `/profiles/${post.authorId}`

              return (
                <article className="dispatch-card" key={post.id}>
                  <img src={post.image} alt={post.title} />
                  <div>
                    <Link className="profile-link" to={authorPath}>
                      {isOrganizer ? <ShieldCheck size={18} /> : <User size={18} />}
                      {post.handle}
                    </Link>
                    <h3>{post.title}</h3>
                    <p>
                      Practical field notes from recent Mandalay hikes, focused on terrain, safety,
                      and timing.
                    </p>
                    <div className="dispatch-actions">
                      <Link to={authorPath}>
                        <MessageDots size={18} />
                        View profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => setLiked({ ...liked, [post.title]: !liked[post.title] })}
                      >
                        {liked[post.title] ? 'Saved' : post.likes}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
