import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const user = await requireRole(Role.USER)
  const { order: orderId } = await searchParams

  if (!orderId) {
    return (
      <div>
        <h1>Compra completada</h1>
        <p className="text-dim">Gracias por tu compra.</p>
        <div style={{ marginTop: '24px' }}>
          <a href="/user/tickets" className="nav-cta">Ver mis entradas</a>
        </div>
      </div>
    )
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      tickets: {
        include: {
          ticketType: { include: { event: true } },
        },
      },
      event: true,
    },
  })

  if (!order || order.userId !== user.id) {
    return (
      <div>
        <h1>Orden no encontrada</h1>
        <a href="/user/events" className="nav-cta">Ver eventos</a>
      </div>
    )
  }

  const isPaid = order.status === 'PAID'

  return (
    <div>
      <h1>{isPaid ? '¡Compra confirmada!' : 'Procesando pago...'}</h1>
      <p className="text-dim">
        {isPaid
          ? `Tu orden se ha completado correctamente. Has ganado ${Math.floor(Number(order.total))} puntos.`
          : 'Tu pago se está procesando. Esto puede tardar unos segundos.'}
      </p>

      <div className="admin-card" style={{ marginTop: '32px' }}>
        <div className="admin-card-label">Evento</div>
        <div className="admin-card-value">{order.event.title}</div>
        <div className="text-dim" style={{ fontSize: '0.85rem', marginTop: '8px' }}>
          {new Date(order.event.startDate).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
          {' · '}
          {order.tickets.length} {order.tickets.length === 1 ? 'entrada' : 'entradas'}
        </div>
      </div>

      {isPaid && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginTop: '32px', marginBottom: '16px' }}>
            Tus entradas
          </h2>
          <div className="admin-list">
            {order.tickets.map((ticket: typeof order.tickets[0]) => (
              <div key={ticket.id} className="admin-list-item">
                <div>
                  <div>
                    <strong>{ticket.ticketType.name}</strong>
                  </div>
                  <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                    Código: {ticket.code}
                  </div>
                </div>
                <span className="admin-badge">Válida</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
        <a href="/user/tickets" className="nav-cta">Ver mis entradas</a>
        <a href="/user/events" className="admin-card-link">Seguir comprando →</a>
      </div>
    </div>
  )
}
