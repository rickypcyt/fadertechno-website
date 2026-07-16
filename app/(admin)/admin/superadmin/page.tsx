import { requireRole } from '@/lib/permissions'
import prisma from '@/lib/prisma'

export default async function SuperAdminDashboard() {
  await requireRole('SUPER_ADMIN')

  const now = new Date()

  const [
    upcomingEvent,
    totalTicketsSold,
    totalEvents,
    allTickets,
    totalUsers,
    activePromoters,
    newsletterSubscribers,
    checkedInTickets,
    totalRewards,
    recentCheckIns,
    recentOrders,
    totalRevenue,
  ] = await Promise.all([
    prisma.event.findFirst({
      where: { published: true, startDate: { gte: now } },
      include: { venue: true, ticketTypes: { include: { tickets: true } } },
      orderBy: { startDate: 'asc' },
    }),
    prisma.ticket.count(),
    prisma.event.count(),
    prisma.ticket.findMany({ include: { ticketType: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PROMOTER' } }),
    prisma.newsletterSubscriber.count({ where: { subscribed: true } }),
    prisma.ticket.count({ where: { checkedIn: true } }),
    prisma.reward.count({ where: { active: true } }),
    prisma.ticket.findMany({
      where: { checkedIn: true },
      include: {
        ticketType: { include: { event: true } },
        order: { include: { user: true } },
      },
      orderBy: { checkedInAt: 'desc' },
      take: 5,
    }),
    prisma.order.findMany({
      where: { status: 'PAID' },
      include: {
        user: true,
        event: true,
        tickets: { include: { ticketType: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    0,
  ])

  const revenue = allTickets.reduce(
    (sum: number, t: typeof allTickets[0]) => sum + Number(t.ticketType.price),
    0
  )

  const upcomingEventSold = upcomingEvent
    ? upcomingEvent.ticketTypes.reduce(
        (sum: number, tt: typeof upcomingEvent.ticketTypes[0]) => sum + tt.tickets.length,
        0
      )
    : 0

  const upcomingEventCapacity = upcomingEvent?.venue?.capacity ?? 0

  const adminLinks = [
    { href: '/admin/events', label: 'Gestionar eventos' },
    { href: '/admin/tickets', label: 'Ver entradas' },
    { href: '/admin/artists', label: 'Artistas' },
    { href: '/admin/promoters', label: 'RRPP' },
    { href: '/admin/users', label: 'Usuarios' },
    { href: '/admin/gallery', label: 'Galería' },
    { href: '/admin/newsletter', label: 'Newsletter' },
    { href: '/admin/rewards', label: 'Recompensas' },
    { href: '/admin/sponsors', label: 'Patrocinadores' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/settings', label: 'Configuración' },
  ]

  const staffLinks = [
    { href: '/staff/verify', label: 'Escanear QR' },
    { href: '/staff/dashboard', label: 'Panel staff' },
  ]

  return (
    <div className="admin-page">
      <h1>Super Admin</h1>
      <p className="text-dim">Control total del sistema</p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '32px', marginBottom: '16px' }}>
        Resumen general
      </h2>
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-label">Próximo evento</div>
          <div className="admin-card-value">
            {upcomingEvent ? upcomingEvent.title : 'Sin eventos'}
          </div>
          <div className="admin-card-meta">
            {upcomingEvent
              ? `${upcomingEventSold} / ${upcomingEventCapacity || '∞'} entradas · ${new Date(upcomingEvent.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`
              : '—'}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Ingresos totales</div>
          <div className="admin-card-value">{revenue.toLocaleString('es-ES')} €</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Entradas vendidas</div>
          <div className="admin-card-value">{totalTicketsSold}</div>
          <div className="admin-card-meta">{checkedInTickets} check-in · {totalTicketsSold - checkedInTickets} pendientes</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Usuarios</div>
          <div className="admin-card-value">{totalUsers}</div>
          <div className="admin-card-meta">{activePromoters} RRPP</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Newsletter</div>
          <div className="admin-card-value">{newsletterSubscribers}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Recompensas activas</div>
          <div className="admin-card-value">{totalRewards}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Eventos totales</div>
          <div className="admin-card-value">{totalEvents}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        Accesos rápidos
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {adminLinks.map((link) => (
          <a key={link.href} href={link.href} className="admin-quick-link">
            {link.label}
          </a>
        ))}
        {staffLinks.map((link) => (
          <a key={link.href} href={link.href} className="admin-quick-link" style={{ borderColor: 'var(--accent)' }}>
            {link.label}
          </a>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '40px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Ventas recientes</h2>
          <div className="admin-list">
            {recentOrders.length === 0 ? (
              <p className="text-dim">No hay ventas.</p>
            ) : (
              recentOrders.map((order: typeof recentOrders[0]) => (
                <div key={order.id} className="admin-list-item">
                  <div>
                    <div><strong>{order.user.name ?? order.user.email}</strong></div>
                    <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                      {order.event.title} · {order.tickets.length} {order.tickets.length === 1 ? 'entrada' : 'entradas'}
                    </div>
                  </div>
                  <span className="admin-badge">{Number(order.total).toFixed(0)}€</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Check-ins recientes</h2>
          <div className="admin-list">
            {recentCheckIns.length === 0 ? (
              <p className="text-dim">No hay validaciones.</p>
            ) : (
              recentCheckIns.map((ticket: typeof recentCheckIns[0]) => (
                <div key={ticket.id} className="admin-list-item">
                  <div>
                    <div><strong>{ticket.order.user.name ?? ticket.order.user.email}</strong></div>
                    <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                      {ticket.ticketType.event.title} · {ticket.ticketType.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                      {ticket.checkedInAt && new Date(ticket.checkedInAt).toLocaleTimeString('es-ES')}
                    </div>
                    <span className="admin-badge" style={{ background: 'rgba(74, 222, 128, 0.15)' }}>✓</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
