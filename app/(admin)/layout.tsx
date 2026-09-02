import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { roleHierarchy } from '@/lib/roles'
import SidePanel from '@/app/components/SidePanel'
import AdminBackBar from '@/app/components/admin/AdminBackBar'
import '../globals.css'
import QueryProvider from '../components/QueryProvider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = (roleHierarchy[user.role] ?? 0) >= roleHierarchy['ADMIN']

  return (
    <QueryProvider>
      {isAdmin ? (
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
          <p>No tienes permisos para acceder al panel.</p>
        </div>
      )}
    </QueryProvider>
  )
}
