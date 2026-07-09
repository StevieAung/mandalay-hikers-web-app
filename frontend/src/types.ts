import type { CSSProperties } from 'react'

export type UserRole = 'explorer' | 'organizer' | 'admin'
export type AuthMode = 'login' | 'register'
export type TrailDifficulty = 'Easy' | 'Moderate' | 'Hard'

export type User = {
  name: string
  email: string
  role: UserRole
}

export type OrganizerApplication = {
  id: string
  name: string
  email: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}

export type Trail = {
  id: string
  name: string
  badge: string
  difficulty: TrailDifficulty
  distance: string
  elevation: string
  image: string
  summary: string
}

export type TrekEvent = {
  id: string
  title: string
  date: string
  time: string
  image: string
  status: string
  difficulty: string
  text: string
}

export type CssVars = CSSProperties & {
  '--bg'?: string
}
