import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return Response.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
  }

  const { code } = await request.json()

  if (!code) {
    return Response.json({ status: 'not_found', message: 'Código requerido' })
  }

  const ticket = await prisma.ticket.findFirst({
    where: { code },
    include: {
      ticketType: { include: { event: true } },
      order: { include: { user: true } },
    },
  })

  if (!ticket) {
    return Response.json({ status: 'not_found', message: 'Código no encontrado' })
  }

  if (ticket.checkedIn) {
    return Response.json({
      status: 'already',
      message: 'Entrada ya validada',
      ticket: {
        id: ticket.id,
        code: ticket.code,
        checkedIn: ticket.checkedIn,
        checkedInAt: ticket.checkedInAt?.toISOString() ?? null,
        ticketType: { name: ticket.ticketType.name },
        order: {
          user: {
            name: ticket.order.user.name,
            email: ticket.order.user.email,
          },
        },
        ticketTypeEvent: {
          title: ticket.ticketType.event.title,
          startDate: ticket.ticketType.event.startDate.toISOString(),
        },
      },
    })
  }

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
    },
  })

  return Response.json({
    status: 'valid',
    message: 'Entrada validada',
    ticket: {
      id: ticket.id,
      code: ticket.code,
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      ticketType: { name: ticket.ticketType.name },
      order: {
        user: {
          name: ticket.order.user.name,
          email: ticket.order.user.email,
        },
      },
      ticketTypeEvent: {
        title: ticket.ticketType.event.title,
        startDate: ticket.ticketType.event.startDate.toISOString(),
      },
    },
  })
}
