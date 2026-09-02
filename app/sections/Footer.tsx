import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function Footer({ dict }: { dict: Dictionary }) {
  const navLinks = [
    { href: '#eventos', label: dict.nav.eventos },
    { href: '#artistas', label: dict.nav.artistas },
    { href: '#historia', label: dict.nav.historia },
    { href: '#archivo', label: dict.nav.archivo },
    { href: '#editorial', label: dict.nav.editorial },
  ]

  return (
    <footer className="footer">
      <div className="footer-top layout-wide">
        <div className="footer-brand">
          <p>
            {dict.footer.brand}
          </p>
        </div>

        <div className="footer-col">
          <h4>{dict.footer.nav}</h4>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>{dict.footer.contact}</h4>
          <ul>
            <li><a href="https://www.instagram.com/fader.music.club/" target="_blank" rel="noopener noreferrer">{dict.nav.instagram}</a></li>
            <li><a href="https://chat.whatsapp.com/C2gchb3EuRQCWLku9eWM4Q" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{dict.footer.rights}</span>
        <span className="footer-brand-location">Alicante, Spain</span>
      </div>
    </footer>
  )
}
