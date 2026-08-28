'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <header className="hero">
      <div className="hero-content">
        <h1>
          <span>FA</span>
          <span>DER</span>
          <span className="sr-only"> — Electrónica atemporal en Alicante</span>
        </h1>
        <span className="hero-tag">
          Electrónica atemporal · Alicante
        </span>
        <p className="hero-desc">
          Colectivo independiente. Centrado en la cultura de club centrado en la atmosfera. Sonido serio sin etiquetas.
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
      <div className="hero-bg">
        <div className="hero-logo-shine">
          <Image
            src="/logofader.png"
            alt="Fader logo"
            width={500}
            height={500}
            priority
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </header>
  )
}
