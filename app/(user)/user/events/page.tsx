import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'

export default async function UserEventsPage() {
  const user = await requireRole(Role.USER)

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

  const userTickets = await prisma.ticket.findMany({
    where: { order: { userId: user.id } },
    include: { ticketType: true },
  })

  const userEventIds = new Set(userTickets.map((t: typeof userTickets[0]) => t.ticketType.eventId))

  return (
    <div>
      <h1>Eventos</h1>
      <p className="text-dim">Próximos eventos disponibles</p>

      {events.length === 0 ? (
        <p className="text-dim" style={{ marginTop: '32px' }}>
          No hay eventos disponibles ahora mismo. Vuelve pronto.
        </p>
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
