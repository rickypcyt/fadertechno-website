import { requireRole } from '@/lib/permissions'
import prisma from '@/lib/prisma'

export default async function DashboardPage() {
  await requireRole('ADMIN')

  const now = new Date()

  const upcomingEvent = await prisma.event.findFirst({
    where: {
      published: true,
      startDate: { gte: now },
    },
    include: {
      venue: true,
      ticketTypes: { include: { tickets: true } },
    },
    orderBy: { startDate: 'asc' },
  })

  const totalTicketsSold = await prisma.ticket.count()
  const totalEvents = await prisma.event.count()

  const allTickets = await prisma.ticket.findMany({
    include: {
      ticketType: true,
    },
  })

  const totalRevenue = allTickets.reduce(
    (sum: number, t: typeof allTickets[0]) => sum + Number(t.ticketType.price),
    0
  )

  const activePromoters = await prisma.user.count({
    where: { role: 'PROMOTER' },
  })

  const newsletterSubscribers = await prisma.newsletterSubscriber.count({
    where: { subscribed: true },
  })

  const upcomingEventSold = upcomingEvent
    ? upcomingEvent.ticketTypes.reduce(
        (sum: number, tt: typeof upcomingEvent.ticketTypes[0]) => sum + tt.tickets.length,
        0
      )
    : 0

  const upcomingEventCapacity = upcomingEvent?.venue?.capacity ?? 0

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-label">Próximo evento</div>
          <div className="admin-card-value">
            {upcomingEvent ? upcomingEvent.title : 'Sin eventos'}
          </div>
          <div className="admin-card-meta">
            {upcomingEvent
              ? new Date(upcomingEvent.startDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                })
              : '—'}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Entradas vendidas</div>
          <div className="admin-card-value">
            {upcomingEvent
              ? `${upcomingEventSold} / ${upcomingEventCapacity || '∞'}`
              : `${totalTicketsSold} total`}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Ingresos</div>
          <div className="admin-card-value">
            {totalRevenue.toLocaleString('es-ES')} €
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">RRPP activos</div>
          <div className="admin-card-value">{activePromoters}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Newsletter</div>
          <div className="admin-card-value">
            {newsletterSubscribers.toLocaleString('es-ES')} suscriptores
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Eventos totales</div>
          <div className="admin-card-value">{totalEvents}</div>
        </div>
      </div>
    </div>
  )
}
