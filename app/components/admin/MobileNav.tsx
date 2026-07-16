'use client'

import { useState } from 'react'
import SignOutButton from './SignOutButton'

type NavItem = {
  href: string
  label: string
}

type Props = {
  brand: string
  navItems: NavItem[]
  userEmail?: string
}

export default function MobileNav({ brand, navItems, userEmail }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mobile-nav">
      <div className="mobile-nav-bar">
        <span className="mobile-nav-brand">{brand}</span>
        <button
          className="mobile-nav-toggle"
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
        <nav className="mobile-nav-menu">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="mobile-nav-link"
            >
              {item.label}
            </a>
          ))}
          {userEmail && (
            <div className="mobile-nav-footer">
              <span className="mobile-nav-user">{userEmail}</span>
              <SignOutButton />
            </div>
          )}
        </nav>
      )}
    </div>
  )
}
