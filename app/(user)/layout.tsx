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
      <header className="user-header">
        <div className="user-header-brand">
          FA<span>DER</span>
        </div>
        <nav className="user-header-nav">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>
        <div className="user-header-footer">
          <span className="user-email">{user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="admin-content">{children}</main>
    </div>
  )
}
