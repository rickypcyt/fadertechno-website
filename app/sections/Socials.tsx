import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/dictionaries'

function ArrowUpRight({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  )
}

export default function Socials({ dict }: { dict: Dictionary }) {
  const socials = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/fader.music.club/',
      info: dict.socials.instagram,
    },
    {
      label: 'WhatsApp',
      href: 'https://chat.whatsapp.com/C2gchb3EuRQCWLku9eWM4Q',
      info: dict.socials.whatsapp,
    },
  ]

  return (
    <section id="redes" className="sec sec-7 layout-wide">
      <div className="reveal reveal-left" style={{ marginBottom: '40px' }}>
        <div className="section-label">{dict.socials.label}</div>
      </div>
      <div className="socials-list reveal reveal-stagger">
        {socials.map((social) => (
          <Link key={social.label} href={social.href} className="socials-row">
            <span className="socials-row-text">
              <span className="socials-row-name">
                {social.label}
                <span className="socials-row-arrow"><ArrowUpRight size={24} /></span>
              </span>
              <span className="socials-row-info">{social.info}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
