import { requireRole } from '@/lib/permissions'
import prisma from '@/lib/prisma'
import DashboardContainer from '@/app/components/DashboardContainer'
import DashboardCard from '@/app/components/DashboardCard'

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
    <DashboardContainer>
      <DashboardCard
        label="Próximo evento"
        value={upcomingEvent ? upcomingEvent.title : 'Sin eventos'}
        meta={upcomingEvent ? new Date(upcomingEvent.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : '—'}
      />
      <DashboardCard
        label="Entradas vendidas"
        value={upcomingEvent ? `${upcomingEventSold} / ${upcomingEventCapacity || '∞'}` : `${totalTicketsSold} total`}
      />
      <DashboardCard
        label="Ingresos"
        value={`${totalRevenue.toLocaleString('es-ES')} €`}
      />
      <DashboardCard
        label="RRPP activos"
        value={activePromoters}
      />
      <DashboardCard
        label="Newsletter"
        value={`${newsletterSubscribers.toLocaleString('es-ES')} suscriptores`}
      />
      <DashboardCard
        label="Eventos totales"
        value={totalEvents}
      />
    </DashboardContainer>
  );
}
