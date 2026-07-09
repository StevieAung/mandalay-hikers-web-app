import { createContext } from 'react'
import type { OrganizerApplication, User } from '../types'

export type RegisterInput = {
  name: string
  email: string
}

export type AuthContextValue = {
  user: User | null
  applications: OrganizerApplication[]
  login: (email: string) => void
  register: (input: RegisterInput) => void
  logout: () => void
  applyForOrganizer: (reason: string) => void
  approveOrganizer: (applicationId: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const readJson = <T>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key)
  return saved ? (JSON.parse(saved) as T) : fallback
}
