import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import SidePanel from '@/app/components/SidePanel'
import BackToDashboard from '@/app/components/admin/BackToDashboard'
import '../globals.css'
import QueryProvider from '../components/QueryProvider'

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
    <QueryProvider>
      <div className="admin-shell">
        <SidePanel userRole={user.role} />
        <main className="admin-main">
          <div className="admin-back-bar">
            <BackToDashboard role={user.role} />
          </div>
          {children}
        </main>
      </div>
    </QueryProvider>
  )
}
