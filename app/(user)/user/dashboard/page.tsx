import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'

export default async function UserDashboardPage() {
  const user = await requireRole(Role.USER)

  const tickets = await prisma.ticket.findMany({
    where: {
      order: { userId: user.id },
    },
    include: {
      ticketType: {
        include: {
          event: true,
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
    orderBy: { startDate: 'asc' },
    take: 3,
  })

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="text-dim">{user.email}</p>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Entradas activas</h3>
          <p className="dashboard-metric">{activeTickets.length}</p>
          <p className="text-dim">entradas pendientes</p>
          <a href="/user/tickets" className="admin-card-link">Ver todas →</a>
        </div>

        <div className="admin-card">
          <h3>Puntos</h3>
          <p className="dashboard-metric">{creditBalance}</p>
          <p className="text-dim">créditos disponibles</p>
          <a href="/user/rewards" className="admin-card-link">Canjear →</a>
        </div>

        <div className="admin-card">
          <h3>Eventos asistidos</h3>
          <p className="dashboard-metric">{attendedEvents.length}</p>
          <p className="text-dim">eventos</p>
        </div>

        <div className="admin-card">
          <h3>Próximos eventos</h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-dim">No hay eventos próximos.</p>
          ) : (
            <ul className="dashboard-list">
              {upcomingEvents.map((event: typeof upcomingEvents[0]) => (
                <li key={event.id}>
                  <strong>{event.title}</strong>
                  <span className="text-dim">
                    {new Date(event.startDate).toLocaleDateString('es-ES')}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <a href="/user/events" className="admin-card-link">Ver todos →</a>
        </div>
      </div>

      <div className="admin-grid" style={{ marginTop: '24px' }}>
        <div className="admin-card">
          <h3>Perfil</h3>
          <p>
            <strong>Nombre:</strong> {user.name ?? 'Sin nombre'}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Rol:</strong> {user.role}
          </p>
          <a href="/user/profile" className="admin-card-link">Editar perfil →</a>
        </div>
      </div>
    </div>
  )
}
