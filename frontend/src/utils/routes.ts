import type { UserRole } from '../types'

export const dashboardPathForRole = (role: UserRole) => {
  if (role === 'admin') return '/admin'
  if (role === 'organizer') return '/organizer-dashboard'
  return '/explorer-dashboard'
}
