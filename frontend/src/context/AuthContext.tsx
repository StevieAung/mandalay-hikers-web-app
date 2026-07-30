import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { OrganizerApplication, User } from '../types'
import { apiRequest } from '../utils/api'
import { AuthContext, readJson } from './authCore'
import type { RegisterInput } from './authCore'

const TOKEN_STORAGE_KEY = 'hikers_auth_token'

type AuthResponse = {
  token: string
  user: User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [isLoading, setIsLoading] = useState(Boolean(token))
  const [applications, setApplications] = useState<OrganizerApplication[]>(() =>
    readJson<OrganizerApplication[]>('hikers_organizer_applications', []),
  )

  const persistSession = useCallback((nextUser: User | null, nextToken: string | null) => {
    setUser(nextUser)
    setToken(nextToken)
    localStorage.removeItem('hikers_user')

    if (nextToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
      return
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }, [])

  const persistApplications = (nextApplications: OrganizerApplication[]) => {
    setApplications(nextApplications)
    localStorage.setItem('hikers_organizer_applications', JSON.stringify(nextApplications))
  }

  useEffect(() => {
    if (!token) {
      return
    }

    const restoreSession = async () => {
      try {
        const nextUser = await apiRequest<User>('/api/auth/me', { token })
        setUser(nextUser)
      } catch {
        persistSession(null, null)
      } finally {
        setIsLoading(false)
      }
    }

    void restoreSession()
  }, [persistSession, token])

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiRequest<AuthResponse>('/api/auth/login', {
        body: JSON.stringify({ email, password }),
        method: 'POST',
      })

      persistSession(response.user, response.token)
      return response.user.role
    },
    [persistSession],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await apiRequest<AuthResponse>('/api/auth/register', {
        body: JSON.stringify(input),
        method: 'POST',
      })

      persistSession(response.user, response.token)
      return response.user.role
    },
    [persistSession],
  )

  const logout = useCallback(async () => {
    const activeToken = token
    persistSession(null, null)

    if (!activeToken) return

    await apiRequest<null>('/api/auth/logout', {
      method: 'POST',
      token: activeToken,
    }).catch(() => null)
  }, [persistSession, token])

  const applyForOrganizer = useCallback(
    (reason: string) => {
      if (!user || user.role !== 'explorer') return

      const alreadyPending = applications.some(
        (application) => application.email === user.email && application.status === 'pending',
      )
      if (alreadyPending) return

      persistApplications([
        {
          id: `APP-${Date.now()}`,
          name: user.name,
          email: user.email,
          reason,
          status: 'pending',
        },
        ...applications,
      ])
    },
    [applications, user],
  )

  const approveOrganizer = useCallback(
    (applicationId: string) => {
      const nextApplications = applications.map((application) =>
        application.id === applicationId
          ? { ...application, status: 'approved' as const }
          : application,
      )
      const approved = nextApplications.find((application) => application.id === applicationId)
      persistApplications(nextApplications)

      if (user && approved?.email === user.email) {
        setUser({ ...user, role: 'organizer' })
      }
    },
    [applications, user],
  )

  const value = useMemo(
    () => ({
      user,
      isLoading,
      applications,
      login,
      register,
      logout,
      applyForOrganizer,
      approveOrganizer,
    }),
    [applications, applyForOrganizer, approveOrganizer, isLoading, login, logout, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
