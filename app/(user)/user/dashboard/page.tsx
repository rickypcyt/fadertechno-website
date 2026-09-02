import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'
import { getCurrentUser } from '@/lib/auth'
import { getNavGrouped } from '@/lib/nav'
import { getGreeting, getFaderSubtitle } from '@/lib/greeting'
import AppHome from '@/app/components/admin/AppHome'

export default async function UserDashboardPage() {
  const user = await requireRole(Role.USER)

  // App grid: user's own group items (exclude the dashboard itself)
  const navGroups = getNavGrouped(user.role)
  const userApps = navGroups
    .find((g) => g.group === 'user')
    ?.items.filter((a) => a.href !== '/user/dashboard') ?? []

  return (
    <AppHome
      apps={userApps}
      greeting={getGreeting(user.role, user.name)}
      subtitle={getFaderSubtitle()}
    />
  )
}
