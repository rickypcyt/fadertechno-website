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

  const checkedIn = tickets.filter((t: typeof tickets[0]) => t.checkedIn).length

  return (
    <div className="admin-page">
      <h1>Entradas</h1>
      <p className="text-dim">{tickets.length} entradas en total · {checkedIn} usadas · {tickets.length - checkedIn} pendientes</p>

      <div className="admin-grid" style={{ marginTop: '24px' }}>
        <div className="admin-card">
          <div className="admin-card-label">Total</div>
          <div className="admin-card-value">{tickets.length}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Asistencias</div>
          <div className="admin-card-value" style={{ color: '#4ade80' }}>{checkedIn}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">No asistidas</div>
          <div className="admin-card-value" style={{ color: '#fbbf24' }}>{tickets.length - checkedIn}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        Listado de entradas
      </h2>
      <div className="admin-list">
        {tickets.length === 0 ? (
          <p className="text-dim">No hay entradas vendidas.</p>
        ) : (
          tickets.map((ticket: typeof tickets[0]) => (
            <div key={ticket.id} className="admin-list-item">
              <div>
                <div><strong>{ticket.ticketType.event.title}</strong></div>
                <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                  {ticket.ticketType.name} · {ticket.order.user.name ?? ticket.order.user.email}
                </div>
                <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                  Código: {ticket.code}
                  {ticket.checkedIn && ticket.checkedInAt && (
                    <> · {new Date(ticket.checkedInAt).toLocaleString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</>
                  )}
                </div>
              </div>
              <span className={`admin-badge${ticket.checkedIn ? '' : ' muted'}`}>
                {ticket.checkedIn ? '✓ Asistió' : 'Pendiente'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
