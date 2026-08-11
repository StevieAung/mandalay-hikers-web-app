import type { CSSProperties } from 'react'

export type UserRole = 'explorer' | 'organizer' | 'admin'
export type AuthMode = 'login' | 'register'

export type User = {
  id?: number
  name: string
  email: string
  role: UserRole
}

export type CssVars = CSSProperties & {
  '--bg'?: string
}
