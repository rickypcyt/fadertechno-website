'use server'

import { getCurrentUser } from '@/lib/auth'

export async function getRedirectUrl(): Promise<string> {
  const user = await getCurrentUser()
  if (!user) return '/login'

  switch (user.role) {
    case 'ADMIN':
      return '/admin/dashboard'
    case 'STAFF':
      return '/staff/dashboard'
    case 'USER':
    default:
      return '/user/dashboard'
  }
}
