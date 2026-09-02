'use client'

import { usePathname } from 'next/navigation'
import BackToDashboard from '@/app/components/admin/BackToDashboard'
import type { Role } from '@/lib/roles'

export default function AdminBackBar({ role }: { role: Role }) {
  const pathname = usePathname()
  const isDashboard =
    pathname === '/admin/dashboard' ||
    pathname === '/staff/dashboard' ||
    pathname === '/user/dashboard'
  if (isDashboard) return null
  return (
    <div className="admin-back-bar">
      <BackToDashboard role={role} />
    </div>
  )
}
