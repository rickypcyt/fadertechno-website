import Link from 'next/link'
import SignOutButton from './SignOutButton'

const navItems = [
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
]

export default function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">FADER ADMIN</div>
      <nav className="admin-nav">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="admin-nav-link">
            {item.label}
          </Link>
        ))}
      </nav>
      <SignOutButton />
    </aside>
  )
}
