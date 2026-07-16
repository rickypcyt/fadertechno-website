import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { roleHierarchy } from '@/lib/roles'
import Sidebar from '@/app/components/admin/Sidebar'
import MobileNav from '@/app/components/admin/MobileNav'

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

  if (!isAdmin) {
    return (
      <div className="admin-unauthorized">
        <h1>403</h1>
        <p>No tienes permisos para acceder al panel.</p>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <Sidebar />
      <MobileNav
        brand="FADER ADMIN"
        navItems={[
          { href: '/admin/dashboard', label: 'Dashboard' },
          { href: '/admin/events', label: 'Eventos' },
          { href: '/admin/tickets', label: 'Entradas' },
          { href: '/admin/artists', label: 'Artistas' },
          { href: '/admin/promoters', label: 'RRPP' },
          { href: '/admin/users', label: 'Usuarios' },
          { href: '/admin/gallery', label: 'Galería' },
          { href: '/admin/newsletter', label: 'Newsletter' },
          { href: '/admin/rewards', label: 'Recompensas' },
          { href: '/admin/sponsors', label: 'Patrocinadores' },
          { href: '/admin/analytics', label: 'Analytics' },
          { href: '/admin/settings', label: 'Configuración' },
        ]}
        userEmail={user.email}
      />
      <main className="admin-main">{children}</main>
    </div>
  )
}
