import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles';
import UserDashboardContainer from '@/app/components/UserDashboardContainer';
import TicketQR from '@/app/components/user/TicketQR';

export default async function UserDashboardPage() {
  const user = await requireRole(Role.USER)

  const tickets = await prisma.ticket.findMany({
    where: {
      order: { userId: user.id },
    },
    include: {
      ticketType: {
        include: {
          event: {
            include: { venue: true },
          },
        },
      },
    },
  })

  const attendedEvents = await prisma.event.findMany({
    where: {
      orders: {
        some: {
          userId: user.id,
          tickets: {
            some: { checkedIn: true },
          },
        },
      },
    },
    orderBy: { startDate: 'desc' },
  })

  const creditTransactions = await prisma.creditTransaction.findMany({
    where: { userId: user.id },
  })

  const creditBalance = creditTransactions.reduce(
    (sum: number, tx: typeof creditTransactions[0]) => sum + tx.amount,
    0
  )

  const activeTickets = tickets.filter((t: typeof tickets[0]) => !t.checkedIn)

  const upcomingEvents = await prisma.event.findMany({
    where: {
      published: true,
      startDate: { gte: new Date() },
    },
    include: { venue: true },
    orderBy: { startDate: 'asc' },
    take: 3,
  })

  const nextEvent = upcomingEvents[0] ?? null
  const hasTicketForNext = nextEvent
    ? activeTickets.some((t) => t.ticketType.event.id === nextEvent.id)
    : false

  return (
    <UserDashboardContainer>
      {/* Perfil */}
      <section className="dash-section">
        <div className="dash-profile">
          <div className="dash-profile-avatar">
            {(user.name ?? user.email ?? '?')[0].toUpperCase()}
          </div>
          <div className="dash-profile-info">
            <h2 className="dash-profile-name">{user.name ?? 'Sin nombre'}</h2>
            <span className="dash-profile-email">{user.email}</span>
          </div>
          <a href="/user/profile" className="dash-profile-edit">Editar</a>
        </div>
      </section>

      {/* Stats rápidas */}
      <section className="dash-section">
        <div className="dash-stats">
          <div className="dash-stat">
            <span className="dash-stat-value">{activeTickets.length}</span>
            <span className="dash-stat-label">Entradas</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{creditBalance}</span>
            <span className="dash-stat-label">Puntos</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{attendedEvents.length}</span>
            <span className="dash-stat-label">Asistidos</span>
          </div>
        </div>
      </section>

      {/* Próximo evento destacado */}
      {nextEvent && (
        <section className="dash-section">
          <h3 className="dash-section-title">Próximo evento</h3>
          <div className="dash-next-event">
            <div className="dash-next-event-info">
              <h4>{nextEvent.title}</h4>
              <p className="text-dim">
                {new Date(nextEvent.startDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} · {nextEvent.venue?.name}
              </p>
            </div>
            {hasTicketForNext ? (
              <span className="dash-ticket-badge">Tienes entrada</span>
            ) : (
              <a href={`/evento/${nextEvent.slug}`} className="nav-cta">Comprar</a>
            )}
          </div>
        </section>
      )}

      {/* Mis entradas con QR */}
      <section className="dash-section">
        <h3 className="dash-section-title">Mis entradas</h3>
        {activeTickets.length === 0 ? (
          <p className="text-dim dash-empty">No tienes entradas activas.</p>
        ) : (
          <div className="dash-tickets">
            {activeTickets.map((ticket) => (
              <TicketQR
                key={ticket.id}
                code={ticket.code}
                eventTitle={ticket.ticketType.event.title}
                ticketType={ticket.ticketType.name}
                eventDate={new Date(ticket.ticketType.event.startDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                venue={ticket.ticketType.event.venue.name}
              />
            ))}
          </div>
        )}
      </section>

      {/* Próximos eventos */}
      <section className="dash-section">
        <h3 className="dash-section-title">Eventos</h3>
        {upcomingEvents.length === 0 ? (
          <p className="text-dim dash-empty">No hay eventos próximos.</p>
        ) : (
          <div className="dash-events">
            {upcomingEvents.map((event) => {
              const hasTicket = activeTickets.some((t) => t.ticketType.event.id === event.id)
              return (
                <div key={event.id} className="dash-event-card">
                  <div className="dash-event-card-info">
                    <h4>{event.title}</h4>
                    <p className="text-dim">
                      {new Date(event.startDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} · {event.venue?.name}
                    </p>
                  </div>
                  {hasTicket ? (
                    <span className="dash-ticket-badge dash-ticket-badge-sm">✓ Entrada</span>
                  ) : (
                    <a href={`/evento/${event.slug}`} className="nav-cta">Comprar</a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Volver al inicio */}
      <div className="dashboard-back">
        <a href="/" className="admin-card-link">← Volver al inicio</a>
      </div>
    </UserDashboardContainer>
  )
}
