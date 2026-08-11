import { useCallback, useEffect, useState } from 'react'
import { CommunityAside } from '../components/community/CommunityAside'
import { FeedComposer } from '../components/community/FeedComposer'
import { FeedPost } from '../components/community/FeedPost'
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
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await apiRequest<PaginatedResponse<ApiPost>>('/api/posts', {
          token: authToken,
        })
        setPosts(response.data)
        setPage(response.current_page ?? 1)
        setLastPage(response.last_page ?? 1)
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
  }, [authToken])

  const loadMore = async () => {
    setIsLoadingMore(true)

    try {
      const response = await apiRequest<PaginatedResponse<ApiPost>>(
        `/api/posts?page=${page + 1}`,
        { token: authToken },
      )
      setPosts((current) => [...current, ...response.data])
      setPage(response.current_page ?? page + 1)
      setLastPage(response.last_page ?? lastPage)
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError ? requestError.message : 'Could not load more posts.',
        title: 'Nothing loaded',
        variant: 'error',
      })
    } finally {
      setIsLoadingMore(false)
    }
  }

  const publish = async (payload: FormData) => {
    try {
      const created = await apiRequest<ApiPost>('/api/posts', {
        body: payload,
        method: 'POST',
        token: authToken,
      })
      setPosts((current) => [created, ...current])
      showToast({
        message: 'Your note is now visible on the community feed.',
        title: 'Post published',
        variant: 'success',
      })
      return null
    } catch (requestError) {
      const message =
        requestError instanceof ApiError ? requestError.message : 'Could not publish your note.'
      showToast({ message, title: 'Post not published', variant: 'error' })
      return message
    }
  }

  const addComment = useCallback(
    async (postId: number, body: string) => {
      try {
        const created = await apiRequest<ApiComment>(`/api/posts/${postId}/comments`, {
          body: JSON.stringify({ body }),
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
    },
    [authToken, showToast],
  )

  const toggleLike = useCallback(
    async (post: ApiPost) => {
      if (!user) {
        showToast({
          message: 'Sign in to react to community posts.',
          title: 'Sign in required',
          variant: 'warning',
        })
        return
      }

      const wasLiked = Boolean(post.is_liked)

      const applyLike = (liked: boolean, count?: number) =>
        setPosts((current) =>
          current.map((entry) =>
            entry.id === post.id
              ? {
                  ...entry,
                  is_liked: liked,
                  likes_count:
                    count ?? Math.max((entry.likes_count ?? 0) + (liked ? 1 : -1), 0),
                }
              : entry,
          ),
        )

      applyLike(!wasLiked)

      try {
        const response = await apiRequest<{ liked: boolean; likes_count: number }>(
          `/api/posts/${post.id}/like`,
          { method: wasLiked ? 'DELETE' : 'POST', token: authToken },
        )
        applyLike(response.liked, response.likes_count)
      } catch (requestError) {
        applyLike(wasLiked, post.likes_count)
        showToast({
          message:
            requestError instanceof ApiError ? requestError.message : 'Could not save your like.',
          title: 'Like not saved',
          variant: 'error',
        })
      }
    },
    [authToken, showToast, user],
  )

  const removePost = useCallback(
    async (postId: number) => {
      if (!window.confirm('Delete this post and all of its comments?')) return

      try {
        await apiRequest<null>(`/api/posts/${postId}`, { method: 'DELETE', token: authToken })
        setPosts((current) => current.filter((post) => post.id !== postId))
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
    },
    [authToken, showToast],
  )

  const removeComment = useCallback(
    async (postId: number, commentId: number) => {
      try {
        await apiRequest<null>(`/api/comments/${commentId}`, {
          method: 'DELETE',
          token: authToken,
        })
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
            requestError instanceof ApiError
              ? requestError.message
              : 'Could not delete this comment.',
          title: 'Comment not deleted',
          variant: 'error',
        })
      }
    },
    [authToken, showToast],
  )

  return (
    <main>
      <section className="community-page">
        <div className="stacked-heading small">
          <span>{t('community.field')}</span>
          <strong>{t('community.title')}</strong>
          <p>{t('community.description')}</p>
        </div>
        <div className="community-layout">
          <CommunityAside />
          <div className="feed-shell">
            <FeedComposer onPublish={publish} user={user} />
            {isLoading && <p className="table-empty">{t('community.loading')}</p>}
            {error && <p className="table-empty danger">{error}</p>}
            {!isLoading && !error && !posts.length && (
              <p className="table-empty">{t('community.noPosts')}</p>
            )}
            {posts.map((post) => (
              <FeedPost
                key={post.id}
                onComment={addComment}
                onDeleteComment={removeComment}
                onDeletePost={removePost}
                onLike={toggleLike}
                post={post}
                viewer={user}
              />
            ))}
            {page < lastPage && (
              <button
                className="button outline wide"
                disabled={isLoadingMore}
                onClick={() => void loadMore()}
                type="button"
              >
                {isLoadingMore ? t('community.loading') : t('community.loadMore')}
              </button>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
