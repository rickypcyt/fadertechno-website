import { requireRole } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'
import { getNavGrouped } from '@/lib/nav'
import AppHome from '@/app/components/admin/AppHome'

export default async function DashboardPage() {
  await requireRole('ADMIN')
  const user = await getCurrentUser()

  // App grid: admin group items (exclude the dashboard itself)
  const navGroups = getNavGrouped(user?.role ?? 'ADMIN')
  const adminApps = navGroups
    .find((g) => g.group === 'admin')
    ?.items.filter((a) => a.href !== '/admin/dashboard') ?? []

  return (
    <AppHome
      apps={adminApps}
      greeting={`Hola, ${user?.name ?? ''}`.trim() || 'Hola'}
      subtitle={new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })}
    />
  )
}
