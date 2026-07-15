import Image from 'next/image'
import Link from 'next/link'
import RegisterModal from './RegisterModal'

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

        <RegisterModal className="nav-cta" />

        <button className="nav-burger" id="navBurger" aria-label="Menú">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}
