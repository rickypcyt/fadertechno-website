import { getCurrentUser } from '@/lib/auth'
import { getNavGrouped } from '@/lib/nav'
import AppHome from '@/app/components/admin/AppHome'

export default async function StaffDashboard() {
  const user = await getCurrentUser()
  if (!user) return null

  // App grid: staff group items (exclude the dashboard itself)
  const navGroups = getNavGrouped(user.role)
  const staffApps = navGroups
    .find((g) => g.group === 'staff')
    ?.items.filter((a) => a.href !== '/staff/dashboard') ?? []

  return (
    <AppHome
      apps={staffApps}
      greeting={`Hola, ${user.name ?? 'Staff'}`}
      subtitle={new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })}
    />
  )
}
