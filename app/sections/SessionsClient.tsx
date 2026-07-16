import Image from 'next/image'
import Link from 'next/link'

type EventData = {
  id: string
  title: string
  slug: string
  description: string
  startDate: Date
  venue: { name: string; city: string | null }
  coverImage: { url: string; alt: string | null } | null
  ticketTypes: { id: string; name: string; price: string }[]
  artists: { artist: { name: string } }[]
} | null

export default function SessionsClient({
  upcoming,
  lastPast,
}: {
  upcoming: EventData
  lastPast: EventData
}) {
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  return (
    <section id="eventos" className="sec sec-2 layout-wide" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      {/* Próximo evento */}
      <div className="sessions-event sessions-event-upcoming reveal">
        {upcoming ? (
          <>
            <div className="sessions-image">
              {upcoming.coverImage ? (
                <Image
                  src={upcoming.coverImage.url}
                  alt={upcoming.coverImage.alt ?? upcoming.title}
                  width={400}
                  height={300}
                  sizes="(max-width: 860px) 100vw, 60vw"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div className="sessions-tba">
                  <span className="sessions-tba-text">{upcoming.title}</span>
                </div>
              )}
              <div className="archive-overlay" />
            </div>
            <div className="sessions-info">
              <div className="section-label">02 — Próximo evento</div>
              <h3>{upcoming.title}</h3>
              <p>{upcoming.description}</p>
              {upcoming.artists.length > 0 && (
                <div className="sessions-artists">
                  {upcoming.artists.map((a, i) => (
                    <span key={i}>{a.artist.name}</span>
                  ))}
                </div>
              )}
              <div className="sessions-meta">
                <div className="sessions-meta-item">
                  <strong>Fecha</strong>
                  {formatDate(upcoming.startDate)}
                </div>
                <div className="sessions-meta-item">
                  <strong>Sala</strong>
                  {upcoming.venue.name}{upcoming.venue.city ? ` — ${upcoming.venue.city}` : ''}
                </div>
                {upcoming.ticketTypes.length > 0 && (
                  <div className="sessions-meta-item">
                    <strong>Desde</strong>
                    {Math.min(...upcoming.ticketTypes.map((t) => Number(t.price)))}€
                  </div>
                )}
              </div>
              <div className="sessions-actions">
                <Link href="/user/events" className="nav-cta">
                  Comprar entradas
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="sessions-tba">
              <span className="sessions-tba-text">TBA</span>
            </div>
            <div className="sessions-info">
              <div className="section-label">02 — Próximo evento</div>
              <h3>Próximamente</h3>
              <p>Pronto anunciaremos el próximo evento. Line-up y fecha por confirmar.</p>
              <div className="sessions-meta">
                <div className="sessions-meta-item">
                  <strong>Sala</strong>
                  Kalicante — Alicante
                </div>
                <div className="sessions-meta-item">
                  <strong>Acceso</strong>
                  +18
                </div>
              </div>
              <div className="sessions-actions">
                <Link href="/user/events" className="nav-cta">
                  Ver eventos disponibles
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Último evento pasado */}
      {lastPast && (
        <div className="sessions-event reveal" style={{ marginTop: '80px' }}>
          <div className="sessions-image">
            {lastPast.coverImage ? (
              <Image
                src={lastPast.coverImage.url}
                alt={lastPast.coverImage.alt ?? lastPast.title}
                width={400}
                height={300}
                sizes="(max-width: 860px) 100vw, 60vw"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div className="sessions-tba">
                <span className="sessions-tba-text">{lastPast.title}</span>
              </div>
            )}
            <div className="archive-overlay" />
          </div>
          <div className="sessions-info">
            <div className="section-label">Última experiencia</div>
            <h3>{lastPast.title}</h3>
            <p>{lastPast.description}</p>
            {lastPast.artists.length > 0 && (
              <div className="sessions-artists">
                {lastPast.artists.map((a, i) => (
                  <span key={i}>{a.artist.name}</span>
                ))}
              </div>
            )}
            <div className="sessions-meta">
              <div className="sessions-meta-item">
                <strong>Fecha</strong>
                {formatDate(lastPast.startDate)}
              </div>
              <div className="sessions-meta-item">
                <strong>Sala</strong>
                {lastPast.venue.name}{lastPast.venue.city ? ` — ${lastPast.venue.city}` : ''}
              </div>
            </div>
            <div className="sessions-actions">
              <Link href="#archivo" className="btn btn-ghost">
                Ver archivo
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
