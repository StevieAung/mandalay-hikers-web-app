import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { InitialAvatar } from '../Portal'

type FeedAvatarProps = {
  avatar?: null | string
  name: string
  size?: 'small' | 'medium'
  to?: string
}

export function FeedAvatar({ avatar, name, size = 'medium', to }: FeedAvatarProps) {
  const content: ReactNode = avatar ? (
    <img alt={name} className="feed-avatar" src={avatar} />
  ) : (
    <InitialAvatar name={name} />
  )

  const wrapper = <span className={`feed-avatar-wrap ${size}`}>{content}</span>

  if (!to) return wrapper

  return (
    <Link aria-label={name} className="feed-avatar-link" to={to}>
      {wrapper}
    </Link>
  )
}
