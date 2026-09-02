'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getNavGrouped } from '@/lib/nav'
import { roleHierarchy, Role } from '@/lib/roles'
import { useDict } from '@/lib/i18n/I18nProvider'

interface SidePanelProps {
  userRole: string
}

function getDashboardHref(role: string): string {
  const level = roleHierarchy[role] ?? 0
  if (level >= roleHierarchy[Role.ADMIN]) return '/admin/dashboard'
  if (level >= roleHierarchy[Role.STAFF]) return '/staff/dashboard'
  return '/user/dashboard'
}

export default function SidePanel({ userRole }: SidePanelProps) {
  const pathname = usePathname()
  const dict = useDict()
  const navGroups = getNavGrouped(userRole)
  const dashboardHref = getDashboardHref(userRole)

  return (
    <aside className="admin-sidebar">
      <Link href={dashboardHref} className="admin-sidebar-brand">
        <div className="admin-sidebar-logo" />
        <span className="admin-sidebar-name">FADER</span>
      </Link>
      <nav className="admin-sidebar-nav">
        {navGroups.map((group, gi) => (
          <div key={group.group} className="admin-nav-group">
            {gi > 0 && (
              <div className="admin-nav-group-label">
                {dict.panel.nav[group.labelKey as keyof typeof dict.panel.nav] ?? group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              const label = dict.panel.nav[item.labelKey as keyof typeof dict.panel.nav] ?? item.label
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-link ${active ? 'active' : ''}`}
                >
                  <span className="admin-nav-tile">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <span className="admin-nav-label">{label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
