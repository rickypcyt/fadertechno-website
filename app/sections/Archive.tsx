'use client'

import Image from 'next/image'
import { Reveal } from '@/app/components/Reveal'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const archiveEvents = [
  { src: '/wonderfull.jpg', title: '', date: '10 jul 2026' },
  { src: '/kalicanteultima.jpg', title: '', date: '19 jun 2026' },
  { src: '/kalicantepenultima.jpg', title: '', date: '30 may 2026' },
  { src: '/kalicanteoscuro.jpg', title: '', date: '01 may 2026' },
]

export default function Archive({ dict }: { dict: Dictionary }) {
  // Duplicamos para el loop seamless del carrusel mobile.
  // La segunda copia se marca como clone y se oculta en desktop (grid).
  const items = [...archiveEvents, ...archiveEvents]

  return (
    <section id="archivo" className="sec sec-5 layout-wide">
      <Reveal from="right" style={{ marginBottom: '56px' }}>
        <div className="section-label">{dict.archive.label}</div>
        <h2 className="section-title">{dict.archive.title}</h2>
      </Reveal>

      <div className="archive-carousel">
        <div className="archive-track archive-track-auto">
          {items.map((event, i) => (
            <div
              key={i}
              className={`archive-item${i >= archiveEvents.length ? ' archive-item-clone' : ''}`}
            >
              <div className="archive-poster">
                <Image
                  src={event.src}
                  alt={event.title}
                  width={400}
                  height={533}
                  sizes="(max-width: 860px) 80vw, 25vw"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
