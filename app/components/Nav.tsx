'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { getTicketsUrlForRole } from '@/lib/role-routes'

const links = [
  { href: '#eventos', label: 'Eventos' },
  { href: '#artistas', label: 'Artistas' },
  { href: '#historia', label: 'Historia' },
  { href: '#archivo', label: 'Archivo' },
  { href: '#editorial', label: 'Editorial' },
]

export default function Nav() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [ticketsUrl, setTicketsUrl] = useState('/user/tickets')

  useEffect(() => {
    authClient.getSession().then((res) => {
      setLoggedIn(!!res.data)
      if (res.data) {
        fetch('/api/me', { credentials: 'include' })
          .then((r) => (r.ok ? r.json() : null))
          .then((me) => {
            if (me?.role) setTicketsUrl(getTicketsUrlForRole(me.role))
          })
      }
    })
  }, [])

  return (
    <nav className="nav" id="nav">
      <div className="container">
        <Link href="/" className="nav-logo">
          <Image
            src="/logofader.png"
            alt="Fader"
            width={56}
            height={56}
            priority
          />
          <span className="nav-logo-text">FADER</span>
        </Link>

        <ul className="nav-links" id="navLinks">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        {loggedIn ? (
          <>
            <Link href={ticketsUrl} className="nav-cta nav-cta-desktop">
              Ver entradas
            </Link>
            <Link href={ticketsUrl} className="nav-cta nav-cta-mobile">
              Ver entradas
            </Link>
          </>
        ) : (
          <>
            <Link href="/register" className="nav-cta nav-cta-desktop">
              Registrarse
            </Link>
            <Link href="/register" className="nav-cta nav-cta-mobile">
              Registrarse
            </Link>
          </>
        )}
      </div>
      <div className="scroll-progress" id="scroll-progress" />
    </nav>
  )
}
