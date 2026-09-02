import Link from 'next/link'
import type { NavItem } from '@/lib/nav'
import type { Role } from '@/lib/roles'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import SignOutButton from '@/app/components/admin/SignOutButton'
import BackToDashboard from '@/app/components/admin/BackToDashboard'

type Props = {
  apps: NavItem[]
  greeting?: string
  subtitle?: string
  profileHref?: string
  role: Role
  dict: Dictionary
}

export default function AppHome({
  apps,
  role,
  dict,
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
          const label = dict.panel.nav[app.labelKey as keyof typeof dict.panel.nav] ?? app.label
          return (
            <Link
              key={app.href}
              href={app.href}
              className="app-home-tile"
            >
              <span className="app-home-icon">
                <Icon size={32} strokeWidth={1.8} />
              </span>
              <span className="app-home-label">{label}</span>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
