import Link from 'next/link'

const socials = [
  {
    label: 'Instagram',
    href: '#',
    info: 'Fotos, reels y anuncios de próximos eventos.',
  },
  {
    label: 'SoundCloud',
    href: '#',
    info: 'Sets grabados, mixes exclusivas y previews.',
  },
  {
    label: 'WhatsApp',
    href: '#',
    info: 'Comunidad privada. Acceso prioritario y novedades.',
  },
]

export default function Socials() {
  return (
    <section id="redes" className="sec sec-7 layout-narrow" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="reveal" style={{ marginBottom: '40px' }}>
        <div className="section-label">07 — Redes</div>
      </div>
      <div className="socials-list reveal">
        {socials.map((social) => (
          <Link key={social.label} href={social.href} className="socials-row">
            <span className="socials-row-name">{social.label}</span>
            <span className="socials-row-info">{social.info}</span>
            <span className="socials-row-arrow">→</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
