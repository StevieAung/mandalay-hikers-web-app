import type { User, UserRole } from '../types'

export type ApiProfile = {
  avatar?: string | null
  bio?: string | null
  cover_image?: string | null
  location?: string | null
  phone?: string | null
}

export type ApiUser = User & {
  favorites_count?: number
  is_banned?: boolean
  joined_events_count?: number
  posts_count?: number
  profile?: ApiProfile | null
}

export type ApiTrail = {
  best_season?: string | null
  cover_image?: string | null
  description: string
  difficulty: string
  distance_km: string | number
  duration: string
  elevation_m: number
  id: number
  images?: ApiTrailImage[]
  location: string
  name: string
  ratings?: ApiRating[]
  ratings_avg_score?: string | number | null
  ratings_count?: number
  required_equipment?: string | null
}

export type ApiTrailImage = {
  id: number
  image_path: string
}

export type ApiRating = {
  created_at: string
  id: number
  review?: string | null
  score: number
  trail_id: number
  updated_at: string
  user: {
    id: number
    name: string
    role: UserRole
  }
  user_id: number
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
  current_page?: number
  data: T[]
  last_page?: number
}
