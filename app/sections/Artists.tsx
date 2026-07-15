import Image from 'next/image'
import Link from 'next/link'

const artists = [
  { name: 'CC', genre: 'Hypnotic Techno', image: '/cc.jpg', span: 'col-6' },
  { name: 'LITN', genre: 'Deep Techno', image: '/litn.jpg', span: 'col-6' },
]

export default function Artists() {
  return (
    <section id="artistas" className="sec sec-3 layout-wide">
      <div className="reveal" style={{ marginBottom: '56px' }}>
        <div className="section-label">03 — Artistas</div>
        <h2 className="section-title">Residentes</h2>
      </div>

      <div className="artists-grid">
        {artists.map((artist) => (
          <div key={artist.name} className={`artist-card reveal ${artist.span}`}>
            <Image
              src={artist.image}
              alt={artist.name}
              width={600}
              height={800}
              sizes="(max-width: 860px) 100vw, 50vw"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div className="artist-overlay">
              <h4>{artist.name}</h4>
              <span className="artist-genre">{artist.genre}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
