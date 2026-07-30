import type { User } from '../types'

export type ApiProfile = {
  avatar?: string | null
  bio?: string | null
  cover_image?: string | null
  location?: string | null
  phone?: string | null
}

export type ApiUser = User & {
  favorites_count?: number
  joined_events_count?: number
  posts_count?: number
  profile?: ApiProfile | null
}

export type ApiTrail = {
  cover_image?: string | null
  difficulty: string
  distance_km: string | number
  elevation_m: number
  id: number
  name: string
}

export type ApiEvent = {
  cover_image?: string | null
  destination: string
  id: number
  participant_limit: number
  participants_count?: number
  starts_at: string
  status: string
  title: string
}

export type ApiPost = {
  body: string
  comments_count?: number
  created_at: string
  id: number
  image?: string | null
  title: string
  user?: ApiUser
  user_id: number
}

export type ApiOrganizerApplication = {
  reviewed_at?: string | null
  status: 'pending' | 'approved' | 'rejected'
}

export type ProfilePayload = {
  approved_organizer_application?: ApiOrganizerApplication | null
  favorites: ApiTrail[]
  hosted_events: ApiEvent[]
  joined_events: ApiEvent[]
  posts: ApiPost[]
  user: ApiUser
}

export type PaginatedResponse<T> = {
  data: T[]
}
