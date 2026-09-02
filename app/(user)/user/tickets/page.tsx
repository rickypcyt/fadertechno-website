import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import TicketQR from '@/app/components/user/TicketQR'

export default async function UserTicketsPage() {
  const user = await requireRole(Role.USER)
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.userTickets

  const tickets = await prisma.ticket.findMany({
    where: {
      order: { userId: user.id },
    },
    include: {
      ticketType: {
        include: {
          event: { include: { venue: true } },
        },
      },
      order: true,
    },
    orderBy: {
      order: { createdAt: 'desc' },
    },
  })

  const activeTickets = tickets.filter((t: typeof tickets[0]) => !t.checkedIn)
  const usedTickets = tickets.filter((t: typeof tickets[0]) => t.checkedIn)

  return (
    <div>
      <h1>{t.title}</h1>
      <p className="text-dim">{t.summary.replace('{count}', String(tickets.length))}</p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        {t.active.replace('{count}', String(activeTickets.length))}
      </h2>
      {activeTickets.length === 0 ? (
        <p className="text-dim">{t.noActive}</p>
      ) : (
        <div className="ticket-list">
          {activeTickets.map((ticket: typeof activeTickets[0]) => (
            <TicketQR
              key={ticket.id}
              code={ticket.code}
              eventTitle={ticket.ticketType.event.title}
              ticketType={ticket.ticketType.name}
              eventDate={new Date(ticket.ticketType.event.startDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
              venue={ticket.ticketType.event.venue.name}
              dict={dict}
            />
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        {t.used.replace('{count}', String(usedTickets.length))}
      </h2>
      {usedTickets.length === 0 ? (
        <p className="text-dim">{t.noUsed}</p>
      ) : (
        <div className="admin-list">
          {usedTickets.map((ticket: typeof usedTickets[0]) => (
            <div key={ticket.id} className="admin-list-item">
              <div>
                <div>
                  <strong>{ticket.ticketType.event.title}</strong>
                </div>
                <div className="text-dim" style={{ fontSize: '1rem' }}>
                  {ticket.ticketType.name} ·{' '}
                  {ticket.checkedInAt &&
                    new Date(ticket.checkedInAt).toLocaleDateString('es-ES')}
                </div>
              </div>
              <span className="admin-badge muted">{t.usedBadge}</span>
            </div>
          ))}
        </div>
      )}

      {/* Past events with QR */}
      {usedTickets.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
            {t.pastEvents}
          </h2>
          <div className="ticket-list">
            {usedTickets.map((ticket: typeof usedTickets[0]) => (
              <TicketQR
                key={ticket.id}
                code={ticket.code}
                eventTitle={ticket.ticketType.event.title}
                ticketType={ticket.ticketType.name}
                eventDate={new Date(ticket.ticketType.event.startDate).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                venue={ticket.ticketType.event.venue.name}
                dict={dict}
              />
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: '40px' }}>
        <a href="/user/events" className="nav-cta">
          {t.seeEvents}
        </a>
      </div>
    </div>
  )
}
