import type { UserRole } from '../types'

export const dashboardPathForRole = (role: UserRole) => {
  if (role === 'admin') return '/admin'
  if (role === 'organizer') return '/organizer-dashboard'
  return '/explorer-dashboard'
}

export const safeLocalReturnPath = (value: string | null | undefined) =>
  value?.startsWith('/') && !value.startsWith('//') ? value : null
