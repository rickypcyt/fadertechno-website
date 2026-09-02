'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Home } from 'lucide-react'
import SignOutButton from './SignOutButton'
import { getNavGrouped } from '@/lib/nav'
import { roleHierarchy, Role } from '@/lib/roles'

type Props = {
  brand: string
  userRole: string
  userEmail?: string
}

function getDashboardHref(role: string): string {
  const level = roleHierarchy[role] ?? 0
  if (level >= roleHierarchy[Role.ADMIN]) return '/admin/dashboard'
  if (level >= roleHierarchy[Role.STAFF]) return '/staff/dashboard'
  return '/user/dashboard'
}

export default function MobileNav({ brand, userRole, userEmail }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const navGroups = getNavGrouped(userRole)
  const dashboardHref = getDashboardHref(userRole)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="mobile-nav">
      <div className="mobile-nav-bar">
        <Link href={dashboardHref} className="mobile-nav-brand">
          <span className="nav-logo-shine mobile-nav-logo-shine">
            <Image
              src="/logofader.png"
              alt="FADER"
              width={28}
              height={28}
              priority
            />
            <span className="nav-logo-shine-overlay" aria-hidden="true" />
          </span>
          <span>{brand}</span>
        </Link>
        <button
          className={`mobile-nav-toggle ${open ? 'open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={open}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {open && (
        <div className="mobile-nav-overlay" onClick={() => setOpen(false)} />
      )}

      <nav className={`mobile-nav-drawer ${open ? 'open' : ''}`}>
        <div className="mobile-nav-drawer-header">
          <span className="mobile-nav-drawer-brand">FADER</span>
          <button
            className="mobile-nav-close"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>
        <div className="mobile-nav-drawer-items">
          {navGroups.map((group, gi) => (
            <div key={group.group} className="mobile-nav-group">
              {gi > 0 && (
                <div className="mobile-nav-group-label">{group.label}</div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mobile-nav-link ${active ? 'active' : ''}`}
                  >
                    <span className="mobile-nav-tile">
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
        {userEmail && (
          <div className="mobile-nav-footer">
            <span className="mobile-nav-user">{userEmail}</span>
            <Link href="/" className="mobile-nav-link">
              <span className="mobile-nav-tile mobile-nav-tile-back">
                <Home size={20} strokeWidth={1.8} />
              </span>
              <span>Volver al inicio</span>
            </Link>
            <SignOutButton />
          </div>
        )}
      </nav>
    </div>
  )
}
