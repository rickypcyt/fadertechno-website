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

        <Link href="/register" className="nav-cta nav-cta-mobile">
          Registrarse
        </Link>
      </div>
    </nav>
  )
}
