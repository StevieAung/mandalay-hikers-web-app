import { useState } from 'react'
import { Link } from 'react-router-dom'
import Comment from 'reicon-react/icons/Comment'
import ThumbsUp from 'reicon-react/icons/ThumbsUp'
import Trash from 'reicon-react/icons/Trash'
import { useLocale } from '../../context/useLocale'
import type { ApiComment, ApiPost, ApiUser } from '../../types/api'
import { formatRelativeTime } from '../../utils/format'
import { FeedAvatar } from './FeedAvatar'
import { ShareMenu } from './ShareMenu'
import { VerifiedBadge } from './VerifiedBadge'

const COLLAPSED_COMMENTS = 2

type FeedPostProps = {
  /** Permalink view: show the whole thread and drop the link out of the timestamp. */
  expanded?: boolean
  onComment: (postId: number, body: string) => Promise<boolean>
  onDeleteComment: (postId: number, commentId: number) => void
  onDeletePost: (postId: number) => void
  onLike: (post: ApiPost) => void
  post: ApiPost
  viewer: ApiUser | null
}

const profilePathFor = (id: number, role?: string) =>
  role === 'organizer' ? `/organizers/${id}` : `/profiles/${id}`

export function FeedPost({
  expanded = false,
  onComment,
  onDeleteComment,
  onDeletePost,
  onLike,
  post,
  viewer,
}: FeedPostProps) {
  const { t } = useLocale()
  const [showComments, setShowComments] = useState(expanded)
  const [showAllComments, setShowAllComments] = useState(expanded)
  const [draft, setDraft] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  const comments = post.comments ?? []
  const commentCount = post.comments_count ?? comments.length
  const likeCount = post.likes_count ?? 0
  const authorName = post.user?.name || 'Community member'
  const authorPath = profilePathFor(post.user_id, post.user?.role)
  const permalink = `/community/${post.id}`

  const canModerate = (ownerId?: number) =>
    Boolean(viewer && (viewer.role === 'admin' || viewer.id === ownerId))

  const visibleComments =
    showAllComments || comments.length <= COLLAPSED_COMMENTS
      ? comments
      : comments.slice(-COLLAPSED_COMMENTS)

  const submitComment = async () => {
    const body = draft.trim()
    if (!body || isReplying) return

    setIsReplying(true)
    if (await onComment(post.id, body)) setDraft('')
    setIsReplying(false)
  }

  const timestamp = formatRelativeTime(post.created_at)

  return (
    <article className="feed-card">
      <header className="feed-card-head">
        <FeedAvatar avatar={post.user?.profile?.avatar} name={authorName} to={authorPath} />
        <div className="feed-author">
          <Link to={authorPath}>
            {authorName}
            {post.user?.is_verified && <VerifiedBadge />}
          </Link>
          {expanded ? (
            <span className="feed-time">{timestamp}</span>
          ) : (
            <Link className="feed-time" to={permalink}>
              {timestamp}
            </Link>
          )}
        </div>
        {canModerate(post.user_id) && (
          <button
            aria-label={t('community.deletePost')}
            className="icon-button"
            onClick={() => onDeletePost(post.id)}
            title={t('community.deletePost')}
            type="button"
          >
            <Trash size={18} />
          </button>
        )}
      </header>

      <div className="feed-body">
        <h3>
          {expanded ? post.title : <Link to={permalink}>{post.title}</Link>}
        </h3>
        <p>{post.body || t('community.note')}</p>
      </div>

      {post.image && (
        <div className="feed-media">
          <img alt={post.title} src={post.image} />
        </div>
      )}

      {(likeCount > 0 || commentCount > 0) && (
        <div className="feed-counts">
          <span>
            {likeCount > 0 && (
              <>
                <ThumbsUp size={14} weight="Filled" /> {likeCount}
              </>
            )}
          </span>
          {commentCount > 0 && (
            <button onClick={() => setShowComments(true)} type="button">
              {commentCount} {t('community.commentCount')}
            </button>
          )}
        </div>
      )}

      <div className="feed-actions">
        <button
          aria-pressed={Boolean(post.is_liked)}
          className={`feed-action ${post.is_liked ? 'active' : ''}`}
          onClick={() => onLike(post)}
          type="button"
        >
          <ThumbsUp size={18} weight={post.is_liked ? 'Filled' : 'Outline'} />
          {post.is_liked ? t('community.liked') : t('community.like')}
        </button>
        <button
          aria-expanded={showComments}
          className="feed-action"
          onClick={() => setShowComments(!showComments)}
          type="button"
        >
          <Comment size={18} />
          {t('community.comment')}
        </button>
        <ShareMenu postId={post.id} title={post.title} />
      </div>

      {showComments && (
        <div className="feed-comments">
          {!comments.length && <p className="table-empty">{t('community.noReplies')}</p>}
          {comments.length > visibleComments.length && (
            <button
              className="feed-more-comments"
              onClick={() => setShowAllComments(true)}
              type="button"
            >
              {t('community.viewAll')} {commentCount} {t('community.commentCount')}
            </button>
          )}
          {visibleComments.map((comment: ApiComment) => {
            const commenterName = comment.user?.name || 'Hiker'

            return (
              <div className="feed-comment" key={comment.id}>
                <FeedAvatar
                  avatar={comment.user?.profile?.avatar}
                  name={commenterName}
                  size="small"
                  to={profilePathFor(comment.user_id, comment.user?.role)}
                />
                <div className="feed-comment-bubble">
                  <strong>
                    {commenterName}
                    {comment.user?.is_verified && <VerifiedBadge size={13} />}
                  </strong>
                  <p>{comment.body}</p>
                </div>
                {canModerate(comment.user_id) && (
                  <button
                    aria-label={t('community.delete')}
                    className="icon-button"
                    onClick={() => onDeleteComment(post.id, comment.id)}
                    title={t('community.delete')}
                    type="button"
                  >
                    <Trash size={15} />
                  </button>
                )}
              </div>
            )
          })}
          {viewer ? (
            <div className="feed-comment-composer">
              <FeedAvatar avatar={viewer.profile?.avatar} name={viewer.name} size="small" />
              <input
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void submitComment()
                  }
                }}
                placeholder={t('community.replyPlaceholder')}
                value={draft}
              />
              <button
                className="button outline"
                disabled={isReplying}
                onClick={() => void submitComment()}
                type="button"
              >
                {t('community.reply')}
              </button>
            </div>
          ) : (
            <Link className="feed-signin-hint" to="/login">
              {t('nav.signIn')}
            </Link>
          )}
        </div>
      )}
    </article>
  )
}
