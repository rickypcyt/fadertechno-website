'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const links = [
  { href: '#eventos', label: 'Eventos' },
  { href: '#artistas', label: 'Artistas' },
  { href: '#historia', label: 'Historia' },
  { href: '#archivo', label: 'Archivo' },
  { href: '#editorial', label: 'Editorial' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="nav" id="nav">
      <div className="container">
        <Link href="/" className="nav-logo">
          <Image
            src="/logo.jpeg"
            alt="Fader"
            width={56}
            height={56}
            priority
          />
          FADER
        </Link>

        <ul className="nav-links" id="navLinks">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <Link href="/register" className="nav-cta nav-cta-desktop">
          Registrarse
        </Link>

        <button
          className="nav-burger"
          id="navBurger"
          aria-label="Menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuOpen && (
        <div className="nav-mobile-menu">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="nav-mobile-link"
            >
              {link.label}
            </a>
          ))}
          <div className="nav-mobile-actions">
            <Link
              href="/register"
              className="nav-cta"
              onClick={() => setMenuOpen(false)}
            >
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
