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
  events_count?: number
  favorites_count?: number
  id: number
  images?: ApiTrailImage[]
  is_favorited?: boolean
  latitude?: number | string | null
  location: string
  longitude?: number | string | null
  name: string
  ratings?: ApiRating[]
  ratings_avg_score?: string | number | null
  ratings_count?: number
  required_equipment?: string | null
  status?: string
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

export type ApiEventOrganizer = {
  id: number
  is_verified?: boolean
  name: string
  role?: UserRole
}

export type ApiEventParticipant = {
  id: number
  name: string
  email?: string
  pivot?: {
    attendance_status: AttendanceStatus
  }
}

export type AttendanceStatus = 'joined' | 'attended' | 'missed'

export type ApiEvent = {
  cover_image?: string | null
  description?: string
  destination: string
  id: number
  is_joined?: boolean
  meeting_point?: string
  organizer?: ApiEventOrganizer | null
  organizer_id?: number
  participant_limit: number
  participants?: ApiEventParticipant[]
  participants_count?: number
  required_equipment?: string | null
  starts_at: string
  status: string
  title: string
  trail?: Pick<
    ApiTrail,
    'best_season' | 'difficulty' | 'distance_km' | 'duration' | 'elevation_m' | 'id' | 'name'
  > | null
  trail_id?: number | null
}

export type ApiComment = {
  body: string
  created_at?: string
  id: number
  post_id: number
  user?: Pick<ApiUser, 'id' | 'is_verified' | 'name' | 'profile' | 'role'>
  user_id: number
}

export type ApiPost = {
  body: string
  comments?: ApiComment[]
  comments_count?: number
  created_at: string
  id: number
  image?: string | null
  is_liked?: boolean
  likes_count?: number
  title: string
  user?: ApiUser
  user_id: number
}

export type ApiOrganizerApplication = {
  created_at?: string
  id?: number
  reason?: string
  review_note?: string | null
  reviewed_at?: string | null
  status: 'pending' | 'approved' | 'rejected'
}

export type ProfilePayload = {
  approved_organizer_application?: ApiOrganizerApplication | null
  latest_organizer_application?: ApiOrganizerApplication | null
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
