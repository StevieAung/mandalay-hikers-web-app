import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ArrowLeft from 'reicon-react/icons/ArrowLeft'
import { FeedPost } from '../components/community/FeedPost'
import { Footer } from '../components/Footer'
import { useAuth } from '../context/useAuth'
import { useLocale } from '../context/useLocale'
import { useToast } from '../context/useToast'
import type { ApiComment, ApiPost } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>()
  const { authToken, user } = useAuth()
  const { t } = useLocale()
  const { showToast } = useToast()
  const [post, setPost] = useState<ApiPost | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true)

      try {
        const response = await apiRequest<ApiPost>(`/api/posts/${postId}`, { token: authToken })
        setPost(response)
        setError(null)
      } catch (requestError) {
        setError(
          requestError instanceof ApiError && requestError.status !== 404
            ? requestError.message
            : null,
        )
        setPost(null)
      } finally {
        setIsLoading(false)
      }
    }

    void loadPost()
  }, [authToken, postId])

  const addComment = async (_postId: number, body: string) => {
    try {
      const created = await apiRequest<ApiComment>(`/api/posts/${_postId}/comments`, {
        body: JSON.stringify({ body }),
        method: 'POST',
        token: authToken,
      })
      setPost((current) =>
        current
          ? {
              ...current,
              comments: [...(current.comments ?? []), created],
              comments_count: (current.comments_count ?? 0) + 1,
            }
          : current,
      )
      return true
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError ? requestError.message : 'Could not post your comment.',
        title: 'Comment not posted',
        variant: 'error',
      })
      return false
    }
  }

  const toggleLike = async (current: ApiPost) => {
    if (!user) {
      showToast({
        message: 'Sign in to react to community posts.',
        title: 'Sign in required',
        variant: 'warning',
      })
      return
    }

    const wasLiked = Boolean(current.is_liked)

    const applyLike = (liked: boolean, count?: number) =>
      setPost((entry) =>
        entry
          ? {
              ...entry,
              is_liked: liked,
              likes_count: count ?? Math.max((entry.likes_count ?? 0) + (liked ? 1 : -1), 0),
            }
          : entry,
      )

    applyLike(!wasLiked)

    try {
      const response = await apiRequest<{ liked: boolean; likes_count: number }>(
        `/api/posts/${current.id}/like`,
        { method: wasLiked ? 'DELETE' : 'POST', token: authToken },
      )
      applyLike(response.liked, response.likes_count)
    } catch (requestError) {
      applyLike(wasLiked, current.likes_count)
      showToast({
        message:
          requestError instanceof ApiError ? requestError.message : 'Could not save your like.',
        title: 'Like not saved',
        variant: 'error',
      })
    }
  }

  const removePost = async (targetId: number) => {
    if (!window.confirm('Delete this post and all of its comments?')) return

    try {
      await apiRequest<null>(`/api/posts/${targetId}`, { method: 'DELETE', token: authToken })
      setPost(null)
      showToast({
        message: 'Your post has been removed.',
        title: 'Post deleted',
        variant: 'success',
      })
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError ? requestError.message : 'Could not delete this post.',
        title: 'Post not deleted',
        variant: 'error',
      })
    }
  }

  const removeComment = async (_postId: number, commentId: number) => {
    try {
      await apiRequest<null>(`/api/comments/${commentId}`, { method: 'DELETE', token: authToken })
      setPost((current) =>
        current
          ? {
              ...current,
              comments: (current.comments ?? []).filter((comment) => comment.id !== commentId),
              comments_count: Math.max((current.comments_count ?? 1) - 1, 0),
            }
          : current,
      )
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError
            ? requestError.message
            : 'Could not delete this comment.',
        title: 'Comment not deleted',
        variant: 'error',
      })
    }
  }

  return (
    <main>
      <section className="community-page">
        <div className="feed-shell solo">
          <Link className="feed-back-link" to="/community">
            <ArrowLeft size={16} />
            {t('community.backToFeed')}
          </Link>
          {isLoading && <p className="table-empty">{t('community.loading')}</p>}
          {error && <p className="table-empty danger">{error}</p>}
          {!isLoading && !error && !post && (
            <p className="table-empty">{t('community.postMissing')}</p>
          )}
          {post && (
            <FeedPost
              expanded
              onComment={addComment}
              onDeleteComment={removeComment}
              onDeletePost={removePost}
              onLike={toggleLike}
              post={post}
              viewer={user}
            />
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
