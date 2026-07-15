'use server'

import { getCurrentUser } from '@/lib/auth'

export async function getRedirectUrl(): Promise<string> {
  const user = await getCurrentUser()
  if (!user) return '/login'

  switch (user.role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/admin/dashboard'
    case 'STAFF':
      return '/staff/dashboard'
    case 'PROMOTER':
      return '/promoter/dashboard'
    case 'USER':
    default:
      return '/user/dashboard'
  }
}
