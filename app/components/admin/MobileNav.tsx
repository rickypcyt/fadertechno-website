'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from './SignOutButton'

type NavItem = {
  href: string
  label: string
  icon?: string
}

type Props = {
  brand: string
  navItems: NavItem[]
  userEmail?: string
}

export default function MobileNav({ brand, navItems, userEmail }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

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
        <Link href="/admin/dashboard" className="mobile-nav-brand">
          <Image
            src="/logofader.png"
            alt="FADER"
            width={28}
            height={28}
            priority
          />
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
            ×
          </button>
        </div>
        <div className="mobile-nav-drawer-items">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-link ${pathname === item.href ? 'active' : ''}`}
            >
              {item.icon && <span className="mobile-nav-icon">{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        {userEmail && (
          <div className="mobile-nav-footer">
            <span className="mobile-nav-user">{userEmail}</span>
            <Link href="/" className="mobile-nav-link">
              <span className="mobile-nav-icon">←</span>
              <span>Volver al inicio</span>
            </Link>
            <SignOutButton />
          </div>
        )}
      </nav>
    </div>
  )
}
