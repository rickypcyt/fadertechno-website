import Image from 'next/image'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type Artist = {
  name: string
  genre: string
  image: string
  span: string
  descKey: 'LITN' | 'Cristian Camilo' | 'RUISUK'
}

const artists: Artist[] = [
  {
    name: 'LITN',
    genre: 'Deep Techno',
    image: '/litn.jpg',
    span: 'col-4',
    descKey: 'LITN',
  },
  {
    name: 'Cristian Camilo',
    genre: 'Hypnotic Techno',
    image: '/cc.jpg',
    span: 'col-4',
    descKey: 'Cristian Camilo',
  },
  {
    name: 'RUISUK',
    genre: 'Techno',
    image: '/ruisuk.jpeg',
    span: 'col-4',
    descKey: 'RUISUK',
  },
]

export default function Artists({ dict }: { dict: Dictionary }) {
  return (
    <section id="artistas" className="sec sec-3 layout-wide">
      <div className="reveal reveal-scale" style={{ marginBottom: '56px' }}>
        <div className="section-label">{dict.artists.label}</div>
        <h2 className="section-title">{dict.artists.title}</h2>
      </div>

      <div className="artists-grid">
        {artists.map((artist) => (
          <div
            key={artist.name}
            className={`artist-card reveal reveal-scale ${artist.span}`}
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
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
