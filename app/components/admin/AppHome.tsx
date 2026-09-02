import Link from 'next/link'
import type { NavItem } from '@/lib/nav'
import type { Role } from '@/lib/roles'
import SignOutButton from '@/app/components/admin/SignOutButton'
import BackToDashboard from '@/app/components/admin/BackToDashboard'

type Props = {
  apps: NavItem[]
  greeting?: string
  subtitle?: string
  profileHref?: string
  role: Role
}

export default function AppHome({
  apps,
  role,
}: Props) {
  return (
    <div className="app-home">
      <nav className="app-home-navbar">
        <BackToDashboard role={role} />
        <SignOutButton />
      </nav>

      <section className="app-home-grid">
        {apps.map((app) => {
          const Icon = app.icon
          return (
            <Link
              key={app.href}
              href={app.href}
              className="app-home-tile"
            >
              <span className="app-home-icon">
                <Icon size={32} strokeWidth={1.8} />
              </span>
              <span className="app-home-label">{app.label}</span>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
