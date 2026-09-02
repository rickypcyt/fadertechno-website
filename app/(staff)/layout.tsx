import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { roleHierarchy } from '@/lib/roles'
import SidePanel from '@/app/components/SidePanel'
import AdminBackBar from '@/app/components/admin/AdminBackBar'
import '../globals.css'
import QueryProvider from '../components/QueryProvider'

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

  return (
    <QueryProvider>
      {isStaff ? (
        <div className="admin-shell">
          <SidePanel userRole={user.role} />
          <main className="admin-main">
            <AdminBackBar role={user.role} />
            {children}
          </main>
        </div>
      ) : (
        <div className="admin-unauthorized">
          <h1>403</h1>
          <p>No tienes permisos para acceder al panel de staff.</p>
        </div>
      )}
    </QueryProvider>
  )
}
