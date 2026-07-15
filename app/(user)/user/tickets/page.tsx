import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'

export default async function UserTicketsPage() {
  const user = await requireRole(Role.USER)

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
      <h1>Mis entradas</h1>
      <p className="text-dim">{tickets.length} entradas en total</p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        Activas ({activeTickets.length})
      </h2>
      {activeTickets.length === 0 ? (
        <p className="text-dim">No tienes entradas activas.</p>
      ) : (
        <div className="admin-list">
          {activeTickets.map((ticket: typeof activeTickets[0]) => (
            <div key={ticket.id} className="admin-list-item">
              <div>
                <div>
                  <strong>{ticket.ticketType.event.title}</strong>
                </div>
                <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                  {ticket.ticketType.name} ·{' '}
                  {new Date(ticket.ticketType.event.startDate).toLocaleDateString('es-ES')}
                </div>
                <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                  Código: {ticket.code}
                </div>
              </div>
              <span className="admin-badge">Válida</span>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        Usadas ({usedTickets.length})
      </h2>
      {usedTickets.length === 0 ? (
        <p className="text-dim">Aún no has usado ninguna entrada.</p>
      ) : (
        <div className="admin-list">
          {usedTickets.map((ticket: typeof usedTickets[0]) => (
            <div key={ticket.id} className="admin-list-item">
              <div>
                <div>
                  <strong>{ticket.ticketType.event.title}</strong>
                </div>
                <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                  {ticket.ticketType.name} ·{' '}
                  {ticket.checkedInAt &&
                    new Date(ticket.checkedInAt).toLocaleDateString('es-ES')}
                </div>
              </div>
              <span className="admin-badge muted">Usada</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <a href="/user/events" className="nav-cta">
          Ver eventos disponibles
        </a>
      </div>
    </div>
  )
}
