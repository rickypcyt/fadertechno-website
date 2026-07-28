'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from './SignOutButton'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '▤' },
  { href: '/admin/superadmin', label: 'Super Admin', icon: '⚡', superAdminOnly: true },
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
]

export default function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname()
  const visibleItems = navItems.filter(
    (item) => !item.superAdminOnly || userRole === 'SUPER_ADMIN'
  )

  return (
    <aside className="admin-sidebar">
      <Link href="/admin/dashboard" className="admin-sidebar-brand">
        <Image
          src="/logofader.png"
          alt="FADER"
          width={32}
          height={32}
          priority
        />
        <span className="admin-sidebar-name">FADER</span>
      </Link>
      <nav className="admin-sidebar-nav">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-link ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">{item.icon}</span>
            <span className="admin-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <Link href="/" className="admin-nav-link">
          <span className="admin-nav-icon">←</span>
          <span className="admin-nav-label">Volver al inicio</span>
        </Link>
        <SignOutButton />
      </div>
    </aside>
  )
}
