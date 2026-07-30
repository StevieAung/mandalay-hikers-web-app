import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MessageDots from 'reicon-react/icons/MessageDots'
import ShieldCheck from 'reicon-react/icons/ShieldCheck'
import User from 'reicon-react/icons/User'
import { Footer } from '../components/Footer'
import { useLocale } from '../context/useLocale'
import type { ApiPost, PaginatedResponse } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'

export default function CommunityPage() {
  const { t } = useLocale()
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await apiRequest<PaginatedResponse<ApiPost>>('/api/posts')
        setPosts(response.data)
        setError(null)
      } catch (requestError) {
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Could not load community posts.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadPosts()
  }, [])

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
            {isLoading && <p className="table-empty">Loading community posts...</p>}
            {error && <p className="table-empty danger">{error}</p>}
            {!isLoading && !error && !posts.length && (
              <p className="table-empty">No community posts yet.</p>
            )}
            {posts.map((post) => {
              const isOrganizer = post.user?.role === 'organizer'
              const authorPath = isOrganizer
                ? `/organizers/${post.user_id}`
                : `/profiles/${post.user_id}`
              const authorName = post.user?.name || 'Community member'

              return (
                <article className="dispatch-card" key={post.id}>
                  {post.image ? (
                    <img src={post.image} alt={post.title} />
                  ) : (
                    <span className="image-placeholder">No image</span>
                  )}
                  <div>
                    <Link className="profile-link" to={authorPath}>
                      {isOrganizer ? <ShieldCheck size={18} /> : <User size={18} />}
                      {authorName}
                    </Link>
                    <h3>{post.title}</h3>
                    <p>{post.body || t('community.note')}</p>
                    <div className="dispatch-actions">
                      <Link to={authorPath}>
                        <MessageDots size={18} />
                        {t('community.profile')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setLiked({ ...liked, [post.title]: !liked[post.title] })}
                      >
                        {liked[post.title] ? 'Saved' : `${post.comments_count ?? 0} comments`}
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
