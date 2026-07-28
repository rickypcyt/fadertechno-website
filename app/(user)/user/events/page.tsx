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
        <a href="/" className="back-link">Volver</a>
      </div>
      <h1>Eventos</h1>
      <p className="text-dim">Próximos eventos disponibles</p>

      <div className="admin-grid" style={{ marginTop: '32px' }}>
        {events.length === 0 ? (
          <div className="admin-card">
            <h3>FADER Club Wilson</h3>
            <p className="text-dim">14 de Agosto · Discoteca Wilson — Alicante · +18</p>
            <p className="text-dim">Line-up: RUISUK, Cristian Camilo, LITN</p>
            <div className="admin-card-meta"><span className="admin-badge">14 Ago</span></div>
          </div>
        ) : (
          events.map((event) => {
            const hasTicket = userEventIds.has(event.id);
            const minPrice = Math.min(...event.ticketTypes.map(t => Number(t.price)));
            return (
              <div key={event.id} className="admin-card">
                <h3>{event.title}</h3>
                <p className="text-dim">
                  {new Date(event.startDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}{' '}· {event.venue.name}
                </p>
                {event.artists.length > 0 && (
                  <p className="text-dim">{event.artists.map(a => a.artist.name).join(', ')}</p>
                )}
                <div className="admin-card-meta">
                  {hasTicket ? (
                    <span className="admin-badge">Comprado</span>
                  ) : (
                    <>
                      <span className="admin-badge">desde {minPrice}€</span>
                      <a href={`/evento/${event.slug}`} className="nav-cta">Comprar</a>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  )
}
