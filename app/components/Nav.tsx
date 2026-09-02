'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Ticket, UserPlus } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useUserStore } from '@/lib/store'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { locales, type Locale } from '@/lib/i18n/config'

export default function Nav({ dict }: { dict: Dictionary }) {
  const { isLoggedIn, ticketsUrl, setUser, clearUser } = useUserStore()
  const pathname = usePathname()

  const links = [
    { href: '#eventos', label: dict.nav.eventos },
    { href: '#artistas', label: dict.nav.artistas },
    { href: '#historia', label: dict.nav.historia },
    { href: '#archivo', label: dict.nav.archivo },
    { href: '#editorial', label: dict.nav.editorial },
  ]

  // Detect current locale from pathname
  const currentLang = (locales.find((l) => pathname.startsWith(`/${l}`)) ?? 'es') as Locale

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res.data) {
        fetch('/api/me', { credentials: 'include' })
          .then((r) => (r.ok ? r.json() : null))
          .then((me) => {
            if (me?.role) {
              setUser({ role: me.role, name: me.name ?? null, email: me.email ?? null })
            }
          })
      } else {
        clearUser()
      }
    })
  }, [setUser, clearUser])

  // Build href for language switch (preserve current path, swap locale)
  const switchLang = (target: Locale) => {
    const newPath = pathname.replace(`/${currentLang}`, `/${target}`)
    return newPath
  }

  return (
    <nav className="nav" id="nav">
      <div className="nav-bar">
        <Link href={`/${currentLang}`} className="nav-logo" aria-label="FADER">
          <span className="nav-logo-shine">
            <Image
              src="/logofader.png"
              alt="Fader"
              width={56}
              height={56}
              priority
            />
            <span className="nav-logo-shine-overlay" aria-hidden="true" />
          </span>
          <span className="nav-logo-text">FADER</span>
        </Link>

        <ul className="nav-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        {isLoggedIn ? (
          <Link href={ticketsUrl} className="nav-account nav-account-center">
            <Ticket size={18} strokeWidth={2} className="nav-account-icon" aria-hidden="true" />
            <span className="nav-account-text">{dict.nav.verEntradas}</span>
          </Link>
        ) : (
          <Link href={`/${currentLang}/register`} className="nav-account nav-account-center">
            <UserPlus size={18} strokeWidth={2} className="nav-account-icon" aria-hidden="true" />
            <span className="nav-account-text">{dict.nav.registrarse}</span>
          </Link>
        )}

        <div className="nav-right">
          <div className="nav-lang">
            {locales.map((l, i) => (
              <span key={l}>
                {i > 0 && <span className="nav-lang-divider">/</span>}
                <Link
                  href={switchLang(l)}
                  className={`nav-lang-link ${l === currentLang ? 'is-active' : ''}`}
                >
                  {l.toUpperCase()}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="scroll-progress" id="scroll-progress" />
    </nav>
  )
}
