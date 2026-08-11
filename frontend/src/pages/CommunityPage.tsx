import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MessageDots from 'reicon-react/icons/MessageDots'
import ShieldCheck from 'reicon-react/icons/ShieldCheck'
import User from 'reicon-react/icons/User'
import { Footer } from '../components/Footer'
import { useAuth } from '../context/useAuth'
import { useLocale } from '../context/useLocale'
import { useToast } from '../context/useToast'
import type { ApiComment, ApiPost, PaginatedResponse } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'

export default function CommunityPage() {
  const { authToken, user } = useAuth()
  const { t } = useLocale()
  const { showToast } = useToast()
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [openComments, setOpenComments] = useState<number | null>(null)
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({})

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

  const publish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim() || !body.trim()) {
      setFormError('Add both a subject and a note before publishing.')
      return
    }

    setIsPublishing(true)
    setFormError(null)

    const payload = new FormData()
    payload.append('title', title.trim())
    payload.append('body', body.trim())
    if (image) payload.append('image', image)

    try {
      const created = await apiRequest<ApiPost>('/api/posts', {
        body: payload,
        method: 'POST',
        token: authToken,
      })
      setPosts([{ ...created, comments: [], comments_count: 0 }, ...posts])
      setTitle('')
      setBody('')
      setImage(null)
      showToast({
        message: 'Your note is now visible on the community board.',
        title: 'Dispatch published',
        variant: 'success',
      })
    } catch (requestError) {
      const message =
        requestError instanceof ApiError ? requestError.message : 'Could not publish your note.'
      setFormError(message)
      showToast({ message, title: 'Dispatch not published', variant: 'error' })
    } finally {
      setIsPublishing(false)
    }
  }

  const addComment = async (postId: number) => {
    const draft = (commentDrafts[postId] || '').trim()
    if (!draft) return

    try {
      const created = await apiRequest<ApiComment>(`/api/posts/${postId}/comments`, {
        body: JSON.stringify({ body: draft }),
        method: 'POST',
        token: authToken,
      })
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments ?? []), created],
                comments_count: (post.comments_count ?? 0) + 1,
              }
            : post,
        ),
      )
      setCommentDrafts((current) => ({ ...current, [postId]: '' }))
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError ? requestError.message : 'Could not post your comment.',
        title: 'Comment not posted',
        variant: 'error',
      })
    }
  }

  const removePost = async (postId: number) => {
    if (!window.confirm('Delete this post and all of its comments?')) return

    try {
      await apiRequest<null>(`/api/posts/${postId}`, { method: 'DELETE', token: authToken })
      setPosts((current) => current.filter((post) => post.id !== postId))
      showToast({ message: 'Your post has been removed.', title: 'Post deleted', variant: 'success' })
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError ? requestError.message : 'Could not delete this post.',
        title: 'Post not deleted',
        variant: 'error',
      })
    }
  }

  const removeComment = async (postId: number, commentId: number) => {
    try {
      await apiRequest<null>(`/api/comments/${commentId}`, { method: 'DELETE', token: authToken })
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: (post.comments ?? []).filter((comment) => comment.id !== commentId),
                comments_count: Math.max((post.comments_count ?? 1) - 1, 0),
              }
            : post,
        ),
      )
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError ? requestError.message : 'Could not delete this comment.',
        title: 'Comment not deleted',
        variant: 'error',
      })
    }
  }

  const canModerate = (ownerId?: number) =>
    Boolean(user && (user.role === 'admin' || user.id === ownerId))

  return (
    <main>
      <section className="community-page">
        <div className="stacked-heading small">
          <span>{t('community.field')}</span>
          <strong>{t('community.title')}</strong>
          <p>{t('community.description')}</p>
        </div>
        <div className="community-board">
          {user ? (
            <form className="dispatch-form" onSubmit={publish}>
              <h2>{t('community.share')}</h2>
              <input
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t('community.subject')}
                value={title}
              />
              <textarea
                onChange={(event) => setBody(event.target.value)}
                placeholder={t('community.placeholder')}
                value={body}
              />
              <input
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                type="file"
              />
              {formError && <p className="table-empty danger">{formError}</p>}
              <button className="button cta wide" disabled={isPublishing} type="submit">
                {isPublishing ? 'Publishing...' : t('community.publish')}
              </button>
            </form>
          ) : (
            <article className="dispatch-form">
              <h2>{t('community.share')}</h2>
              <p>Sign in to publish trail notes and reply to other hikers.</p>
              <Link className="button cta wide" to="/login">
                {t('nav.signIn')}
              </Link>
            </article>
          )}
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
              const comments = post.comments ?? []
              const isOpen = openComments === post.id

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
                        onClick={() => setOpenComments(isOpen ? null : post.id)}
                      >
                        {post.comments_count ?? comments.length} comments
                      </button>
                      {canModerate(post.user_id) && (
                        <button type="button" onClick={() => void removePost(post.id)}>
                          Delete post
                        </button>
                      )}
                    </div>
                    {isOpen && (
                      <div className="comment-thread">
                        {comments.length ? (
                          comments.map((comment) => (
                            <div className="comment-item" key={comment.id}>
                              <strong>{comment.user?.name || 'Hiker'}</strong>
                              <p>{comment.body}</p>
                              {canModerate(comment.user_id) && (
                                <button
                                  type="button"
                                  onClick={() => void removeComment(post.id, comment.id)}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="table-empty">No replies yet.</p>
                        )}
                        {user && (
                          <div className="comment-composer">
                            <input
                              onChange={(event) =>
                                setCommentDrafts((current) => ({
                                  ...current,
                                  [post.id]: event.target.value,
                                }))
                              }
                              placeholder="Add a reply..."
                              value={commentDrafts[post.id] || ''}
                            />
                            <button
                              className="button outline"
                              type="button"
                              onClick={() => void addComment(post.id)}
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
