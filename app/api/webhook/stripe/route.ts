import { stripe } from '@/lib/stripe'
import prisma, { Prisma } from '@/lib/prisma'
import type { Stripe } from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId
    const itemsJson = session.metadata?.items

    if (!orderId || !itemsJson) {
      return new Response('Missing metadata', { status: 400 })
    }

    const items: { ticketTypeId: string; quantity: number }[] =
      JSON.parse(itemsJson)

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      })

      if (!order || order.status === 'PAID') return

      for (const item of items) {
        const tt = await tx.ticketType.findUnique({
          where: { id: item.ticketTypeId },
        })
        if (!tt) continue

        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { stock: { decrement: item.quantity } },
        })

        for (let i = 0; i < item.quantity; i++) {
          await tx.ticket.create({
            data: {
              code: generateTicketCode(),
              orderId: order.id,
              ticketTypeId: item.ticketTypeId,
            },
          })
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      })

      const totalPaid = Number(order.total)
      const pointsToEarn = Math.floor(totalPaid)

      if (pointsToEarn > 0) {
        await tx.creditTransaction.create({
          data: {
            userId: order.userId,
            amount: pointsToEarn,
            type: 'EARN',
            description: `Puntos por compra de entradas (Order ${order.id.slice(-6)})`,
          },
        })
      }
    })
  }

  return new Response('OK', { status: 200 })
}

function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `FC-${code}`
}
