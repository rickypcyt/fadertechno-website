import { getCurrentUser } from '@/lib/auth'
import SignOutButton from '@/app/components/admin/SignOutButton'
import MobileNav from '@/app/components/admin/MobileNav'

const navLinks = [
  { href: '/user/dashboard', label: 'Dashboard' },
  { href: '/user/events', label: 'Eventos' },
  { href: '/user/tickets', label: 'Mis entradas' },
  { href: '/user/rewards', label: 'Canjear puntos' },
  { href: '/user/profile', label: 'Perfil' },
]

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div style={{ paddingBottom: '80px' }}>
        <div className="container">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell user-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          FA<span>DER</span>
        </div>
        <nav className="admin-sidebar-nav">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-user">{user.email}</span>
          <SignOutButton />
        </div>
      </aside>
      <MobileNav
        brand="FADER"
        navItems={navLinks}
        userEmail={user.email}
      />
      <main className="admin-content">{children}</main>
    </div>
  )
}
