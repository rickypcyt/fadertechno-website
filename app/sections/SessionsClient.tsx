import Image from 'next/image'
import Link from 'next/link'
import { formatEventDate, formatShortDate } from '@/lib/dates'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'

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
  dict,
  lang,
  upcoming,
  lastPast,
}: {
  dict: Dictionary
  lang: Locale
  upcoming: EventData
  lastPast: EventData
}) {
  const formatDate = (date: Date) => formatEventDate(date, lang)

  return (
    <section id="eventos" className="sec sec-2 layout-wide">
      {/* Próximo evento */}
      <div className="sessions-event sessions-event-upcoming reveal reveal-right">
        {upcoming ? (
          <>
            <div className="section-label sessions-label">{dict.sessions.nextLabel}</div>
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
              <h3>{upcoming.title}</h3>
              {upcoming.artists.length > 0 && (
                <div className="sessions-artists">
                  {upcoming.artists.map((a, i) => (
                    <span key={i}>{a.artist.name}</span>
                  ))}
                </div>
              )}
              <div className="sessions-meta">
                <div className="sessions-meta-item">
                  <strong>{dict.sessions.date}</strong>
                  {formatDate(upcoming.startDate)}
                </div>
                <div className="sessions-meta-item">
                  <strong>{dict.sessions.venue}</strong>
                  {upcoming.venue.name}{upcoming.venue.city ? ` — ${upcoming.venue.city}` : ''}
                </div>
                {upcoming.ticketTypes.length > 0 && (
                  <div className="sessions-meta-item">
                    <strong>{dict.sessions.from}</strong>
                    {Math.min(...upcoming.ticketTypes.map((t) => Number(t.price)))}€
                  </div>
                )}
              </div>
              <div className="sessions-actions">
                <Link href={`/evento/${upcoming.slug}`} className="nav-cta">
                  {dict.sessions.buyTickets}
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="sessions-past">
            <div className="sessions-past-header">
              <div className="section-label sessions-label">{dict.sessions.nextLabel}</div>
            </div>

            <div className="sessions-past-body">
              <div className="sessions-past-image">
                <div className="sessions-tba">
                  <span className="sessions-tba-text">{dict.sessions.tba}</span>
                </div>
              </div>

              <div className="sessions-past-info">
                <h3>{dict.sessions.comingSoon}</h3>
                <p>{dict.sessions.comingSoonDesc}</p>
                <div className="sessions-meta">
                  <div className="sessions-meta-item">
                    <strong>{dict.sessions.venue}</strong>
                    {dict.sessions.tba}
                  </div>
                  <div className="sessions-meta-item">
                    <strong>{dict.sessions.access}</strong>
                    +18
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Último evento pasado */}
      {lastPast && (
        <div className="sessions-past reveal reveal-left">
          <div className="sessions-past-header">
            <div className="section-label sessions-label">{dict.sessions.lastLabel}</div>
            <div className="sessions-past-date">
              {formatShortDate(lastPast.startDate, lang)}
            </div>
          </div>

          <div className="sessions-past-body">
            <div className="sessions-past-image">
              {lastPast.coverImage ? (
                <Image
                  src={lastPast.coverImage.url}
                  alt={lastPast.coverImage.alt ?? lastPast.title}
                  width={400}
                  height={300}
                  sizes="(max-width: 860px) 100vw, 50vw"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div className="sessions-tba">
                  <span className="sessions-tba-text">{lastPast.title}</span>
                </div>
              )}
              <div className="archive-overlay" />
            </div>

            <div className="sessions-past-info">
              <h3>{lastPast.title}</h3>
              {lastPast.artists.length > 0 && (
                <div className="sessions-artists">
                  {lastPast.artists.map((a, i) => (
                    <span key={i}>{a.artist.name}</span>
                  ))}
                </div>
              )}
              <p>{lastPast.description}</p>
              <div className="sessions-meta">
                <div className="sessions-meta-item">
                  <strong>{dict.sessions.date}</strong>
                  {formatDate(lastPast.startDate)}
                </div>
                <div className="sessions-meta-item">
                  <strong>{dict.sessions.venue}</strong>
                  {lastPast.venue.name}{lastPast.venue.city ? ` — ${lastPast.venue.city}` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
