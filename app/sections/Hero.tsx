import Image from 'next/image'
import Link from 'next/link'
import Marquee from '@/app/components/layout/Marquee'

export default function Hero() {
  return (
    <header className="hero">
      <div className="hero-bg">
        <Image
          src="/logo.jpeg"
          alt="Fader logo"
          width={500}
          height={500}
          priority
          style={{ width: '100%', height: 'auto' }}
        />
      </div>

      <div className="hero-content">
        <span className="hero-tag">
          Techno contemporáneo · Alicante
        </span>
        <h1>
          FA<span>DER</span>
        </h1>
        <div className="hero-sub">
          <p>
            Colectivo independiente. Eventos centrados en el techno,
            el sonido y la cultura de club. Sin concesiones.
          </p>
          <div className="hero-actions">
            <Link href="#eventos" className="btn btn-primary">
              Próximo evento
            </Link>
            <Link href="#archivo" className="btn btn-ghost">
              Archivo
            </Link>
          </div>
        </div>
      </div>

      <Marquee
        items={['FADER', 'CLUB', 'TECHNO', 'ALICANTE', '2026']}
        speed={50}
        opacity={0.04}
      />
    </header>
  )
}
