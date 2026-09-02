import {
  Home,
  Calendar,
  Ticket,
  Gift,
  UserCircle,
  ShieldCheck,
  ScanLine,
  LayoutDashboard,
  Users,
  Mail,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import { Role, roleHierarchy } from '@/lib/roles'

export type NavGroup = 'user' | 'staff' | 'admin'

export type NavItem = {
  href: string
  label: string
  labelKey: string
  icon: LucideIcon
  color: string
  group: NavGroup
  minRole: Role
}

export const navGroupLabels: Record<NavGroup, string> = {
  user: 'Mi cuenta',
  staff: 'Staff',
  admin: 'Administración',
}

export const navGroupLabelKeys: Record<NavGroup, string> = {
  user: 'myAccount',
  staff: 'staff',
  admin: 'admin',
}

// All navigation items across the app, ordered by group then relevance.
// `color` is a CSS gradient used as the iOS-style icon tile background.
export const allNavItems: NavItem[] = [
  // ===== USER =====
  {
    href: '/user/dashboard',
    label: 'Inicio',
    labelKey: 'home',
    icon: Home,
    color: 'linear-gradient(135deg, #346181 0%, #91AAC6 100%)',
    group: 'user',
    minRole: Role.USER,
  },
  {
    href: '/user/events',
    label: 'Eventos',
    labelKey: 'events',
    icon: Calendar,
    color: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
    group: 'user',
    minRole: Role.USER,
  },
  {
    href: '/user/tickets',
    label: 'Mis entradas',
    labelKey: 'myTickets',
    icon: Ticket,
    color: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    group: 'user',
    minRole: Role.USER,
  },
  {
    href: '/user/rewards',
    label: 'Canjear puntos',
    labelKey: 'redeemPoints',
    icon: Gift,
    color: 'linear-gradient(135deg, #F472B6 0%, #DB2777 100%)',
    group: 'user',
    minRole: Role.USER,
  },
  {
    href: '/user/profile',
    label: 'Perfil',
    labelKey: 'profile',
    icon: UserCircle,
    color: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
    group: 'user',
    minRole: Role.USER,
  },

  // ===== STAFF =====
  {
    href: '/staff/dashboard',
    label: 'Staff',
    labelKey: 'staff',
    icon: ShieldCheck,
    color: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    group: 'staff',
    minRole: Role.STAFF,
  },
  {
    href: '/staff/verify',
    label: 'Escanear QR',
    labelKey: 'scanQR',
    icon: ScanLine,
    color: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
    group: 'staff',
    minRole: Role.STAFF,
  },

  // ===== ADMIN =====
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    labelKey: 'dashboard',
    icon: LayoutDashboard,
    color: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    group: 'admin',
    minRole: Role.ADMIN,
  },
  {
    href: '/admin/events',
    label: 'Eventos',
    labelKey: 'events',
    icon: Calendar,
    color: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
    group: 'admin',
    minRole: Role.ADMIN,
  },
  {
    href: '/admin/tickets',
    label: 'Entradas',
    labelKey: 'tickets',
    icon: Ticket,
    color: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    group: 'admin',
    minRole: Role.ADMIN,
  },
  {
    href: '/admin/users',
    label: 'Usuarios',
    labelKey: 'users',
    icon: Users,
    color: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    group: 'admin',
    minRole: Role.ADMIN,
  },
  {
    href: '/admin/newsletter',
    label: 'Newsletter',
    labelKey: 'newsletter',
    icon: Mail,
    color: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    group: 'admin',
    minRole: Role.ADMIN,
  },
  {
    href: '/admin/rewards',
    label: 'Recompensas',
    labelKey: 'rewards',
    icon: Gift,
    color: 'linear-gradient(135deg, #F472B6 0%, #DB2777 100%)',
    group: 'admin',
    minRole: Role.ADMIN,
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    labelKey: 'analytics',
    icon: BarChart3,
    color: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    group: 'admin',
    minRole: Role.ADMIN,
  },
]

export type NavGrouped = {
  group: NavGroup
  label: string
  labelKey: string
  items: NavItem[]
}

export function getNavGrouped(role: string): NavGrouped[] {
  const level = roleHierarchy[role] ?? 0
  const visible = allNavItems.filter((item) => {
    return level >= roleHierarchy[item.minRole]
  })

  const groups: NavGroup[] = ['user', 'staff', 'admin']
  return groups
    .map((group) => ({
      group,
      label: navGroupLabels[group],
      labelKey: navGroupLabelKeys[group],
      items: visible.filter((i) => i.group === group),
    }))
    .filter((g) => g.items.length > 0)
}

export function getNavItemsFlat(role: string): NavItem[] {
  return getNavGrouped(role).flatMap((g) => g.items)
}
