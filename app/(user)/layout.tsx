import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'
import SignOutButton from '@/app/components/admin/SignOutButton'

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
  let user

  try {
    user = await requireRole(Role.USER)
  } catch {
    redirect('/login')
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
      <main className="admin-content">{children}</main>
    </div>
  )
}
