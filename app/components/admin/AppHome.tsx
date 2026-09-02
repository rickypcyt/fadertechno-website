import Link from 'next/link'
import type { NavItem } from '@/lib/nav'

type Props = {
  apps: NavItem[]
  greeting?: string
  subtitle?: string
}

export default function AppHome({
  apps,
  greeting,
  subtitle,
}: Props) {
  return (
    <div className="app-home">
      <header className="app-home-header">
        <div className="app-home-greeting">
          <h1 className="app-home-title">{greeting ?? 'Panel'}</h1>
          {subtitle && <p className="app-home-subtitle">{subtitle}</p>}
        </div>
      </header>

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
