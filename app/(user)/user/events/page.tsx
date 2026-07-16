import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export default async function EventsPage() {
  const user = await getCurrentUser()

  const events = await prisma.event.findMany({
    where: {
      published: true,
      startDate: { gte: new Date() },
    },
    include: {
      venue: true,
      ticketTypes: true,
      artists: { include: { artist: true } },
    },
    orderBy: { startDate: 'asc' },
  })

  const userTickets = user
    ? await prisma.ticket.findMany({
        where: { order: { userId: user.id } },
        include: { ticketType: true },
      })
    : []

  const userEventIds = new Set(
    userTickets.map((t: typeof userTickets[0]) => t.ticketType.eventId)
  )

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <a href="/" className="text-dim" style={{ fontSize: '0.85rem' }}>
          ← Volver
        </a>
      </div>
      <h1>Eventos</h1>
      <p className="text-dim">Próximos eventos disponibles</p>

      {events.length === 0 ? (
        <div className="admin-list" style={{ marginTop: '32px' }}>
          <div className="admin-list-item">
            <div>
              <div>
                <strong>FADER Session 015 — TBA</strong>
              </div>
              <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                Próximamente · Kalicante — Alicante · +18
              </div>
              <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                Pronto anunciaremos line-up y fecha.
              </div>
            </div>
            <div className="admin-actions">
              <span className="admin-badge">Próximamente</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-list" style={{ marginTop: '32px' }}>
          {events.map((event: typeof events[0]) => {
            const hasTicket = userEventIds.has(event.id)
            const minPrice = Math.min(
              ...event.ticketTypes.map((t: typeof event.ticketTypes[0]) => Number(t.price))
            )

            return (
              <div key={event.id} className="admin-list-item">
                <div>
                  <div>
                    <strong>{event.title}</strong>
                  </div>
                  <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                    {new Date(event.startDate).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}{' '}
                    · {event.venue.name}
                  </div>
                  {event.artists.length > 0 && (
                    <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                      {event.artists.map((a: typeof event.artists[0]) => a.artist.name).join(', ')}
                    </div>
                  )}
                </div>
                <div className="admin-actions">
                  {hasTicket ? (
                    <span className="admin-badge">Comprado</span>
                  ) : (
                    <>
                      <span className="admin-badge">
                        desde {minPrice}€
                      </span>
                      <a href={`/user/events/${event.id}`} className="nav-cta">
                        Comprar
                      </a>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
