import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export default async function AdminTicketsPage() {
  await requireRole('ADMIN')

  const tickets = await prisma.ticket.findMany({
    include: {
      ticketType: { include: { event: true } },
      order: { include: { user: true } },
    },
    orderBy: { order: { createdAt: 'desc' } },
  })

  return (
    <div className="admin-page">
      <h1>Entradas</h1>
      <p className="text-dim">{tickets.length} entradas en total</p>
      <div className="admin-list" style={{ marginTop: '24px' }}>
        {tickets.length === 0 ? (
          <p className="text-dim">No hay entradas vendidas.</p>
        ) : (
          tickets.map((ticket: typeof tickets[0]) => (
            <div key={ticket.id} className="admin-list-item">
              <div>
                <div><strong>{ticket.ticketType.event.title}</strong></div>
                <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                  {ticket.ticketType.name} · {ticket.order.user.email}
                </div>
                <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                  Código: {ticket.code}
                </div>
              </div>
              <span className={`admin-badge${ticket.checkedIn ? '' : ' muted'}`}>
                {ticket.checkedIn ? 'Usada' : 'Válida'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
