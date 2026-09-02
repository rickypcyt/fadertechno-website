import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'

export default async function EventsPage() {
  const user = await getCurrentUser()
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.userEvents

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
      <h1>{t.title}</h1>
      <p className="text-dim">{t.subtitle}</p>

      <div className="admin-grid" style={{ marginTop: '32px' }}>
        {events.length === 0 ? (
          <div className="admin-card">
            <p className="text-dim">{t.empty}</p>
          </div>
        ) : (
          events.map((event) => {
            const hasTicket = userEventIds.has(event.id);
            const minPrice = Math.min(...event.ticketTypes.map(t => t.priceCents / 100));
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
                    <span className="admin-badge">{t.bought}</span>
                  ) : (
                    <>
                      <span className="admin-badge">{t.from.replace('{price}', String(minPrice))}</span>
                      <a href={`/evento/${event.slug}`} className="nav-cta">{t.buy}</a>
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
