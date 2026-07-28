import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import TicketSelector from '@/app/components/TicketSelector'

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getCurrentUser()

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      venue: true,
      ticketTypes: { orderBy: { price: 'asc' } },
      artists: { include: { artist: true } },
      coverImage: true,
    },
  })

  if (!event || !event.published) {
    notFound()
  }

  const userTickets = user
    ? await prisma.ticket.findMany({
        where: {
          order: { userId: user.id },
          ticketType: { eventId: event.id },
        },
      })
    : []

  const hasTicket = userTickets.length > 0

  const eventTime = new Date(event.startDate).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="event-page">
      <div className="event-back">
        <Link href="/" className="back-link">
          Volver
        </Link>
      </div>

      <div className="event-body">
        {/* Left: poster */}
        <div className="event-poster">
          {event.coverImage ? (
            <a
              href={event.coverImage.url}
              target="_blank"
              rel="noopener noreferrer"
              className="event-poster-link"
            >
              <Image
                src={event.coverImage.url}
                alt={event.coverImage.alt ?? event.title}
                width={600}
                height={800}
                priority
                sizes="(max-width: 860px) 100vw, 400px"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </a>
          ) : (
            <h1 className="event-title-no-cover">{event.title}</h1>
          )}
        </div>

        {/* Right: content */}
        <div className="event-content">
          <div className="event-header">
            <div className="event-cover-date">
              <span className="event-cover-day">
                {new Date(event.startDate).toLocaleDateString('es-ES', { day: '2-digit' })}
              </span>
              <span className="event-cover-month">
                {new Date(event.startDate).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
              </span>
            </div>
            <h1 className="event-cover-title">{event.title}</h1>
            <div className="event-cover-meta">
              <span>{event.venue.name}{event.venue.city ? ` · ${event.venue.city}` : ''}</span>
              <span>{eventTime}h</span>
            </div>
          </div>

          {event.artists.length > 0 && (
            <div className="event-section">
              <div className="event-section-label">Line-up</div>
              <div className="event-lineup">
                {event.artists.map((a, i) => (
                  <div key={a.artist.id} className="event-artist">
                    <span className="event-artist-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="event-artist-name">{a.artist.name}</span>
                    {a.artist.resident && <span className="event-artist-tag">Residente</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.description && (
            <div className="event-section">
              <div className="event-section-label">Info</div>
              <p className="event-description">{event.description}</p>
            </div>
          )}

          <div className="event-section">
            <div className="event-section-label">Venue</div>
            <div className="event-venue">
              <div className="event-venue-name">{event.venue.name}</div>
              <div className="event-venue-loc">
                {event.venue.address}{event.venue.city ? ` · ${event.venue.city}` : ''}
              </div>
              {event.venue.capacity && (
                <div className="event-venue-cap">Capacidad: {event.venue.capacity}</div>
              )}
            </div>
          </div>

          <div className="event-tickets">
            {hasTicket && (
              <div className="event-has-ticket">
                <div className="event-has-ticket-label">Ya tienes entrada</div>
                <div className="event-has-ticket-count">
                  {userTickets.length} {userTickets.length === 1 ? 'entrada' : 'entradas'}
                </div>
                <Link href="/user/tickets" className="back-link" style={{ marginTop: '12px' }}>
                  Ver mis entradas
                </Link>
              </div>
            )}

            <div className="event-tickets-header">
              <div className="event-section-label">Entradas</div>
              {event.ticketTypes.length > 0 && (
                <div className="event-tickets-from">
                  Desde {Math.min(...event.ticketTypes.map((t) => Number(t.price)))}€
                </div>
              )}
            </div>

            <TicketSelector
              ticketTypes={event.ticketTypes.map((tt) => ({
                id: tt.id,
                name: tt.name,
                price: tt.price.toString(),
                stock: tt.stock,
              }))}
              eventId={event.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
