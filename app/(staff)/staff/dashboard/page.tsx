import { getCurrentUser } from '@/lib/auth'
import { getNavGrouped } from '@/lib/nav'
import { getGreeting, getFaderSubtitle } from '@/lib/greeting'
import AppHome from '@/app/components/admin/AppHome'

export default async function StaffDashboard() {
  const user = await getCurrentUser()
  if (!user) return null

  // App grid: user + staff group items (exclude the dashboard itself)
  const navGroups = getNavGrouped(user.role)
  const staffApps = navGroups
    .filter((g) => g.group === 'user' || g.group === 'staff')
    .flatMap((g) => g.items)
    .filter((a) => a.href !== '/staff/dashboard' && a.href !== '/user/dashboard')

  return (
    <AppHome
      apps={staffApps}
      greeting={getGreeting(user.role, user.name)}
      subtitle={getFaderSubtitle()}
    />
  )
}
