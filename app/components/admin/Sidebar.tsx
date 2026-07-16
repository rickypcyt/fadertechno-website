import Link from 'next/link'
import SignOutButton from './SignOutButton'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/superadmin', label: '⚡ Super Admin', superAdminOnly: true },
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
]

export default function Sidebar({ userRole }: { userRole?: string }) {
  const visibleItems = navItems.filter(
    (item) => !item.superAdminOnly || userRole === 'SUPER_ADMIN'
  )

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">FADER ADMIN</div>
      <nav className="admin-nav">
        {visibleItems.map((item) => (
          <Link key={item.href} href={item.href} className="admin-nav-link">
            {item.label}
          </Link>
        ))}
      </nav>
      <SignOutButton />
    </aside>
  )
}
