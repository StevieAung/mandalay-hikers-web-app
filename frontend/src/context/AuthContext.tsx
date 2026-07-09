import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { OrganizerApplication, User, UserRole } from '../types'
import { AuthContext, readJson } from './authCore'
import type { RegisterInput } from './authCore'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readJson<User | null>('hikers_user', null))
  const [applications, setApplications] = useState<OrganizerApplication[]>(() =>
    readJson<OrganizerApplication[]>('hikers_organizer_applications', []),
  )

  const persistUser = (nextUser: User | null) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem('hikers_user', JSON.stringify(nextUser))
      return
    }
    localStorage.removeItem('hikers_user')
  }

  const persistApplications = (nextApplications: OrganizerApplication[]) => {
    setApplications(nextApplications)
    localStorage.setItem('hikers_organizer_applications', JSON.stringify(nextApplications))
  }

  const login = useCallback(
    (email: string) => {
      const approvedForOrganizer = applications.some(
        (application) => application.email === email && application.status === 'approved',
      )
      const role: UserRole = email.includes('admin')
        ? 'admin'
        : email.includes('organizer') || approvedForOrganizer
          ? 'organizer'
          : 'explorer'
      persistUser({
        email,
        name: role === 'admin' ? 'Zaw Min' : role === 'organizer' ? 'Mandalay Trails' : 'Aung Kyaw',
        role,
      })
    },
    [applications],
  )

  const register = useCallback(({ name, email }: RegisterInput) => {
    persistUser({ name: name || 'New Explorer', email, role: 'explorer' })
  }, [])

  const logout = useCallback(() => persistUser(null), [])

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
        persistUser({ ...user, role: 'organizer' })
      }
    },
    [applications, user],
  )

  const value = useMemo(
    () => ({ user, applications, login, register, logout, applyForOrganizer, approveOrganizer }),
    [applications, applyForOrganizer, approveOrganizer, login, logout, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
