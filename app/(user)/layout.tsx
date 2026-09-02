import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import SidePanel from '@/app/components/SidePanel'
import MobileNav from '@/app/components/admin/MobileNav'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="admin-shell">
      <SidePanel userRole={user.role} />
      <MobileNav brand="FADER" userRole={user.role} userEmail={user.email} />
      <main className="admin-main">{children}</main>
    </div>
  )
}
