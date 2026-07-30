import { createContext } from 'react'
import type { OrganizerApplication, User } from '../types'

export type RegisterInput = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export type AuthContextValue = {
  user: User | null
  isLoading: boolean
  applications: OrganizerApplication[]
  login: (email: string, password: string) => Promise<User['role']>
  register: (input: RegisterInput) => Promise<User['role']>
  logout: () => Promise<void>
  applyForOrganizer: (reason: string) => void
  approveOrganizer: (applicationId: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const readJson = <T>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key)
  return saved ? (JSON.parse(saved) as T) : fallback
}
