'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import { roleHierarchy, Role } from '@/lib/roles'

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
  const dashboardHref = getDashboardHref(role)
  const isOnDashboard = pathname === dashboardHref

  // On the dashboard itself, the back button goes to the site home
  const href = isOnDashboard ? '/' : dashboardHref
  const Icon = isOnDashboard ? Home : ArrowLeft
  const label = isOnDashboard ? 'Ir al inicio' : 'Volver al panel'

  return (
    <Link href={href} className="back-dashboard" aria-label={label}>
      <Icon size={20} strokeWidth={2} />
      <span>{label}</span>
    </Link>
  )
}
