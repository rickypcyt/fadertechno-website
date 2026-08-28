import Image from 'next/image'

const fallbackImages = [
  '/wonderfull.jpg',
  '/kalicanteultima.jpg',
  '/kalicanteoscuro.jpg',
  '/kalicantepenultima.jpg',
]

export default async function Archive() {
  return (
    <section id="archivo" className="sec sec-5 layout-wide">
      <div className="reveal reveal-right" style={{ marginBottom: '56px' }}>
        <div className="section-label">05 — Archivo</div>
        <h2 className="section-title">Piezas de museo</h2>
      </div>

      <div className="archive-grid reveal reveal-stagger">
        {fallbackImages.map((src, i) => (
          <div key={src + i} className="archive-item">
            <Image
              src={src}
              alt={`Archivo ${i + 1}`}
              width={400}
              height={300}
              sizes="(max-width: 860px) 50vw, 25vw"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div className="archive-overlay" />
          </div>
        ))}
      </div>
    </section>
  )
}
