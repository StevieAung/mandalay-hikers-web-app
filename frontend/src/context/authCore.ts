import { createContext } from 'react'
import type { User } from '../types'

export type RegisterInput = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export type AuthContextValue = {
  user: User | null
  authToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User['role']>
  register: (input: RegisterInput) => Promise<User['role']>
  logout: () => Promise<void>
  syncAuthenticatedUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
