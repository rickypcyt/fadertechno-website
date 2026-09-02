import { requireRole } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'
import { Role } from '@/lib/roles'
import { getNavGrouped } from '@/lib/nav'
import { getGreeting, getFaderSubtitle } from '@/lib/greeting'
import AppHome from '@/app/components/admin/AppHome'

export default async function DashboardPage() {
  await requireRole('ADMIN')
  const user = await getCurrentUser()

  // App grid: user + staff + admin group items (exclude dashboards)
  const navGroups = getNavGrouped(user?.role ?? Role.ADMIN)
  const adminApps = navGroups
    .flatMap((g) => g.items)
    .filter(
      (a) =>
        a.href !== '/admin/dashboard' &&
        a.href !== '/staff/dashboard' &&
        a.href !== '/user/dashboard'
    )
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))

  return (
    <AppHome
      apps={adminApps}
      role={user?.role ?? Role.ADMIN}
    />
  )
}
