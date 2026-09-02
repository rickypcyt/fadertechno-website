import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { roleHierarchy } from '@/lib/roles'
import SidePanel from '@/app/components/SidePanel'
import MobileNav from '@/app/components/admin/MobileNav'
import { inter, switzer } from '../fonts'
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
    <html lang="es" className={`${inter.variable} ${switzer.variable}`}>
      <body className={inter.className}>
        <QueryProvider>
          {isStaff ? (
            <div className="admin-shell">
              <SidePanel userRole={user.role} />
              <MobileNav brand="FADER" userRole={user.role} userEmail={user.email} />
              <main className="admin-main">{children}</main>
            </div>
          ) : (
            <div className="admin-unauthorized">
              <h1>403</h1>
              <p>No tienes permisos para acceder al panel de staff.</p>
            </div>
          )}
        </QueryProvider>
      </body>
    </html>
  )
}
