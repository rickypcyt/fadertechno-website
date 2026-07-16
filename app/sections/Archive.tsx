import Image from 'next/image'
import prisma from '@/lib/prisma'

export default async function Archive() {
  const now = new Date()

  const pastEvents = await prisma.event.findMany({
    where: {
      published: true,
      startDate: { lt: now },
    },
    include: {
      coverImage: true,
      venue: true,
    },
    orderBy: { startDate: 'desc' },
    take: 8,
  })

  const fallbackImages = [
    '/kalicanteultima.jpg',
    '/kalicanteoscuro.jpg',
    '/kalicantepenultima.jpg',
    '/kalicanteultima.jpg',
  ]

  return (
    <section id="archivo" className="sec sec-5 layout-wide" style={{ paddingTop: '80px' }}>
      <div className="reveal" style={{ marginBottom: '56px' }}>
        <div className="section-label">05 — Archivo</div>
        <h2 className="section-title">Experiencias documentadas</h2>
      </div>

      <div className="archive-grid reveal">
        {pastEvents.length > 0 ? (
          pastEvents.map((event) => (
            <div key={event.id} className="archive-item">
              {event.coverImage ? (
                <Image
                  src={event.coverImage.url}
                  alt={event.coverImage.alt ?? event.title}
                  width={400}
                  height={300}
                  sizes="(max-width: 860px) 50vw, 25vw"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              ) : (
                <Image
                  src={fallbackImages[0]}
                  alt={event.title}
                  width={400}
                  height={300}
                  sizes="(max-width: 860px) 50vw, 25vw"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              )}
              <div className="archive-overlay" />
              <div className="archive-item-info">
                <strong>{event.title}</strong>
                <span>
                  {new Date(event.startDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {event.venue ? ` · ${event.venue.name}` : ''}
                </span>
              </div>
            </div>
          ))
        ) : (
          fallbackImages.map((src, i) => (
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
          ))
        )}
      </div>
    </section>
  )
}
