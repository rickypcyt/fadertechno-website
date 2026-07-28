'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

type Artist = {
  name: string
  genre: string
  image: string
  span: string
  description: string
}

const artists: Artist[] = [
  {
    name: 'LITN',
    genre: 'Deep Techno',
    image: '/litn.jpg',
    span: 'col-4',
    description: 'LITN es un proyecto centrado en el deep techno, con selecciones que transitan entre lo hipnótico y lo oscuro. Su sonido se caracteriza por capas atmosféricas, bajos profundos y una narrativa musical que construye tensión progresiva. Residente habitual en los eventos de FADER.',
  },
  {
    name: 'Cristian Camilo',
    genre: 'Hypnotic Techno',
    image: '/cc.jpg',
    span: 'col-4',
    description: 'Cristian Camilo explora el hypnotic techno con una aproximación minimalista y envolvente. Sus sets combinan ritmos subterráneos, texturas densas y progresiones que mantienen al público en un estado de trance. Parte fundamental del colectivo FADER.',
  },
  {
    name: 'RUISUK',
    genre: 'Techno',
    image: '/ruisuk.jpeg',
    span: 'col-4',
    description: 'RUISUK es un proyecto centrado en el techno con una selección que mezcla lo industrial y lo hipnótico. Residente de FADER, sus sets se caracterizan por ritmos contundentes y atmósferas densas que construyen un viaje sonoro sin concesiones.',
  },
]

export default function Artists() {
  const [selected, setSelected] = useState<Artist | null>(null)

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selected])

  return (
    <section id="artistas" className="sec sec-3 layout-wide">
      <div className="reveal reveal-scale" style={{ marginBottom: '56px' }}>
        <div className="section-label">03 — Artistas</div>
        <h2 className="section-title">Equipo</h2>
      </div>

      <div className="artists-grid">
        {artists.map((artist) => (
          <div
            key={artist.name}
            className={`artist-card reveal reveal-scale ${artist.span}`}
            onClick={() => setSelected(artist)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(artist) }}
          >
            <Image
              src={artist.image}
              alt={artist.name}
              width={600}
              height={800}
              sizes="(max-width: 860px) 100vw, 33vw"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div className="artist-overlay">
              <h4>{artist.name}</h4>
              <span className="artist-genre">{artist.genre}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal artist-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Cerrar">×</button>
            <div className="artist-modal-image">
              <Image
                src={selected.image}
                alt={selected.name}
                width={400}
                height={400}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <h2>{selected.name}</h2>
            <span className="artist-modal-genre">{selected.genre}</span>
            <p>{selected.description}</p>
          </div>
        </div>
      )}
    </section>
  )
}
