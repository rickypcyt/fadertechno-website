import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { roleHierarchy } from '@/lib/roles'
import SidePanel from '@/app/components/SidePanel'
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
      <SidePanel
        navItems={[
          { href: '/admin/dashboard', label: 'Dashboard', icon: '▤' },
          ...(user.role === 'SUPER_ADMIN' ? [{ href: '/admin/superadmin', label: 'Super Admin', icon: '⚡' }] : []),
          { href: '/admin/events', label: 'Eventos', icon: '♪' },
          { href: '/admin/tickets', label: 'Entradas', icon: '🎫' },
          { href: '/admin/artists', label: 'Artistas', icon: '★' },
          { href: '/admin/promoters', label: 'RRPP', icon: '◉' },
          { href: '/admin/users', label: 'Usuarios', icon: '◐' },
          { href: '/admin/gallery', label: 'Galería', icon: '◇' },
          { href: '/admin/newsletter', label: 'Newsletter', icon: '✉' },
          { href: '/admin/rewards', label: 'Recompensas', icon: '◆' },
          { href: '/admin/sponsors', label: 'Patrocinadores', icon: '◈' },
          { href: '/admin/analytics', label: 'Analytics', icon: '▦' },
          { href: '/admin/settings', label: 'Configuración', icon: '⚙' },
        ]}
        userRole={user.role}
      />
      <MobileNav
        brand="FADER ADMIN"
        navItems={[
          { href: '/admin/dashboard', label: 'Dashboard', icon: '▤' },
          ...(user.role === 'SUPER_ADMIN' ? [{ href: '/admin/superadmin', label: 'Super Admin', icon: '⚡' }] : []),
          { href: '/admin/events', label: 'Eventos', icon: '♪' },
          { href: '/admin/tickets', label: 'Entradas', icon: '🎫' },
          { href: '/admin/artists', label: 'Artistas', icon: '★' },
          { href: '/admin/promoters', label: 'RRPP', icon: '◉' },
          { href: '/admin/users', label: 'Usuarios', icon: '◐' },
          { href: '/admin/gallery', label: 'Galería', icon: '◇' },
          { href: '/admin/newsletter', label: 'Newsletter', icon: '✉' },
          { href: '/admin/rewards', label: 'Recompensas', icon: '◆' },
          { href: '/admin/sponsors', label: 'Patrocinadores', icon: '◈' },
          { href: '/admin/analytics', label: 'Analytics', icon: '▦' },
          { href: '/admin/settings', label: 'Configuración', icon: '⚙' },
        ]}
        userEmail={user.email}
      />
      <main className="admin-main">{children}</main>
    </div>
  )
}
