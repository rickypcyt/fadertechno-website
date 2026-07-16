import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export default async function StaffDashboard() {
  const user = await getCurrentUser()
  if (!user) return null

  const totalTickets = await prisma.ticket.count()
  const checkedInTickets = await prisma.ticket.count({ where: { checkedIn: true } })

  const events = await prisma.event.findMany({
    where: { published: true },
    include: {
      ticketTypes: {
        include: {
          tickets: { where: { checkedIn: true } },
        },
      },
    },
    orderBy: { startDate: 'desc' },
    take: 5,
  })

  const recentCheckIns = await prisma.ticket.findMany({
    where: { checkedIn: true },
    include: {
      ticketType: { include: { event: true } },
      order: { include: { user: true } },
    },
    orderBy: { checkedInAt: 'desc' },
    take: 10,
  })

  return (
    <div className="admin-page">
      <h1>Staff</h1>

      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-label">Total entradas</div>
          <div className="admin-card-value">{totalTickets}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Dentro</div>
          <div className="admin-card-value" style={{ color: '#4ade80' }}>{checkedInTickets}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Pendientes</div>
          <div className="admin-card-value" style={{ color: '#fbbf24' }}>{totalTickets - checkedInTickets}</div>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <a href="/staff/verify" className="nav-cta" style={{ display: 'inline-flex' }}>
          Escanear QR
        </a>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        Eventos recientes
      </h2>
      <div className="admin-list">
        {events.length === 0 ? (
          <p className="text-dim">No hay eventos.</p>
        ) : (
          events.map((event: typeof events[0]) => {
            const eventCheckedIn = event.ticketTypes.reduce(
              (sum: number, tt: typeof event.ticketTypes[0]) => sum + tt.tickets.length,
              0
            )
            const eventTotal = event.ticketTypes.reduce(
              (sum: number, tt: typeof event.ticketTypes[0]) => sum + tt.tickets.length,
              0
            )
            return (
              <div key={event.id} className="admin-list-item">
                <div>
                  <div><strong>{event.title}</strong></div>
                  <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                    {new Date(event.startDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <span className="admin-badge">
                  {eventCheckedIn} / {eventTotal} dentro
                </span>
              </div>
            )
          })
        )}
      </div>

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        Asistentes recientes
      </h2>
      <div className="admin-list">
        {recentCheckIns.length === 0 ? (
          <p className="text-dim">Aún no hay validaciones.</p>
        ) : (
          recentCheckIns.map((ticket: typeof recentCheckIns[0]) => (
            <div key={ticket.id} className="admin-list-item">
              <div>
                <div>
                  <strong>{ticket.order.user.name ?? ticket.order.user.email}</strong>
                </div>
                <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                  {ticket.ticketType.event.title} · {ticket.ticketType.name}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                  {ticket.checkedInAt && new Date(ticket.checkedInAt).toLocaleTimeString('es-ES')}
                </div>
                <span className="admin-badge" style={{ background: 'rgba(74, 222, 128, 0.15)' }}>
                  ✓
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
