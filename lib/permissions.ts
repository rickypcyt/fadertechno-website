import { getCurrentUser } from './auth'
import { Role, roleHierarchy } from './roles'

export { Role }

export async function requireRole(minRole: Role | string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  if (roleHierarchy[user.role] < roleHierarchy[minRole]) {
    throw new Error('Forbidden')
  }

  return user
}
