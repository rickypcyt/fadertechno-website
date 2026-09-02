'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import { roleHierarchy, Role } from '@/lib/roles'
import { useDict } from '@/lib/i18n/I18nProvider'

function getDashboardHref(role: Role): string {
  const level = roleHierarchy[role] ?? 0
  if (level >= roleHierarchy[Role.ADMIN]) return '/admin/dashboard'
  if (level >= roleHierarchy[Role.STAFF]) return '/staff/dashboard'
  return '/user/dashboard'
}

type Props = {
  role: Role
}

export default function BackToDashboard({ role }: Props) {
  const pathname = usePathname()
  const dict = useDict()
  const dashboardHref = getDashboardHref(role)
  const isOnDashboard = pathname === dashboardHref

  // On the dashboard itself, the back button goes to the site home
  const href = isOnDashboard ? '/' : dashboardHref
  const Icon = isOnDashboard ? Home : ArrowLeft
  const label = isOnDashboard ? dict.panel.common.goHome : dict.panel.common.backToPanel

  return (
    <Link href={href} className="back-dashboard" aria-label={label}>
      <Icon size={20} strokeWidth={2} />
      <span>{label}</span>
    </Link>
  )
}
