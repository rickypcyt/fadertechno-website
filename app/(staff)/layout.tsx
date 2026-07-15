import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return (
      <div className="admin-unauthorized">
        <h1>403</h1>
        <p>No tienes permisos para acceder al staff.</p>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <main className="admin-main">{children}</main>
    </div>
  )
}
