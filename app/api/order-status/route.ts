import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orderId = request.nextUrl.searchParams.get('order')
  if (!orderId) {
    return Response.json({ error: 'Missing order id' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      tickets: {
        include: { ticketType: true },
      },
    },
  })

  if (!order || order.userId !== user.id) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json({
    status: order.status,
    tickets: order.tickets.map((t: typeof order.tickets[0]) => ({
      id: t.id,
      code: t.code,
      ticketType: { name: t.ticketType.name },
    })),
  })
}
