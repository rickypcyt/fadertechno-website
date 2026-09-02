import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { roleHierarchy } from '@/lib/roles'
import SidePanel from '@/app/components/SidePanel'
import MobileNav from '@/app/components/admin/MobileNav'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const isStaff = (roleHierarchy[user.role] ?? 0) >= roleHierarchy['STAFF']

  if (!isStaff) {
    return (
      <div className="admin-unauthorized">
        <h1>403</h1>
        <p>No tienes permisos para acceder al panel de staff.</p>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <SidePanel userRole={user.role} />
      <MobileNav brand="FADER" userRole={user.role} userEmail={user.email} />
      <main className="admin-main">{children}</main>
    </div>
  )
}
