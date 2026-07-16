import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import SuccessPoller from './SuccessPoller'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const user = await getCurrentUser()
  const { order: orderId } = await searchParams

  if (!user) {
    return (
      <div>
        <h1>Inicia sesión</h1>
        <p className="text-dim">Necesitas iniciar sesión para ver tu orden.</p>
        <div style={{ marginTop: '24px' }}>
          <a href="/login" className="nav-cta">Iniciar sesión</a>
        </div>
      </div>
    )
  }

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
    <SuccessPoller
      orderId={order.id}
      initialIsPaid={isPaid}
      initialTickets={order.tickets.map((t: typeof order.tickets[0]) => ({
        id: t.id,
        code: t.code,
        ticketType: { name: t.ticketType.name },
      }))}
      eventTitle={order.event.title}
      eventDate={new Date(order.event.startDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })}
      ticketCount={order.tickets.length}
      total={order.total.toString()}
    />
  )
}
