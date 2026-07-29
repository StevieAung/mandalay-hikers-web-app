import { useState } from 'react'
import { Link } from 'react-router-dom'
import MessageDots from 'reicon-react/icons/MessageDots'
import ShieldCheck from 'reicon-react/icons/ShieldCheck'
import User from 'reicon-react/icons/User'
import { Footer } from '../components/Footer'
import { useLocalizedContent } from '../data/useLocalizedContent'
import { useLocale } from '../context/useLocale'

export default function CommunityPage() {
  const { t } = useLocale()
  const { communityPosts } = useLocalizedContent()
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  return (
    <main>
      <section className="community-page">
        <div className="stacked-heading small">
          <span>{t('community.field')}</span>
          <strong>{t('community.title')}</strong>
          <p>{t('community.description')}</p>
        </div>
        <div className="community-board">
          <form className="dispatch-form" onSubmit={(event) => event.preventDefault()}>
            <h2>{t('community.share')}</h2>
            <input placeholder={t('community.subject')} />
            <textarea placeholder={t('community.placeholder')} />
            <button className="button cta wide" type="submit">
              {t('community.publish')}
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
                    <p>{t('community.note')}</p>
                    <div className="dispatch-actions">
                      <Link to={authorPath}>
                        <MessageDots size={18} />
                        {t('community.profile')}
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
