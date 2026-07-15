import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export default async function AdminAnalyticsPage() {
  await requireRole('ADMIN')

  const totalEvents = await prisma.event.count()
  const totalTickets = await prisma.ticket.count()
  const totalUsers = await prisma.user.count()
  const totalSubscribers = await prisma.newsletterSubscriber.count({ where: { subscribed: true } })

  const allTickets = await prisma.ticket.findMany({ include: { ticketType: true } })
  const totalRevenue = allTickets.reduce(
    (sum: number, t: typeof allTickets[0]) => sum + Number(t.ticketType.price),
    0
  )

  const checkedIn = allTickets.filter((t: typeof allTickets[0]) => t.checkedIn).length

  const eventsByMonth = await prisma.event.groupBy({
    by: ['startDate'],
    _count: true,
  })

  return (
    <div className="admin-page">
      <h1>Analytics</h1>
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-label">Eventos</div>
          <div className="admin-card-value">{totalEvents}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Entradas vendidas</div>
          <div className="admin-card-value">{totalTickets}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Check-in</div>
          <div className="admin-card-value">{checkedIn}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Ingresos totales</div>
          <div className="admin-card-value">{totalRevenue.toLocaleString('es-ES')} €</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Usuarios</div>
          <div className="admin-card-value">{totalUsers}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Newsletter</div>
          <div className="admin-card-value">{totalSubscribers}</div>
        </div>
      </div>
    </div>
  )
}
