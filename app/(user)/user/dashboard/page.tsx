import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'
import { getCurrentUser } from '@/lib/auth'
import { getNavGrouped } from '@/lib/nav'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import AppHome from '@/app/components/admin/AppHome'

export default async function UserDashboardPage() {
  const user = await requireRole(Role.USER)
  const dict = await getDictionary(defaultLocale)

  // App grid: user's own group items (exclude the dashboard itself)
  const navGroups = getNavGrouped(user.role)
  const userApps = (navGroups
    .find((g) => g.group === 'user')
    ?.items.filter((a) => a.href !== '/user/dashboard') ?? [])
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))

  return (
    <AppHome
      apps={userApps}
      role={user.role}
      dict={dict}
    />
  )
}
