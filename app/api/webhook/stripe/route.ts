import { getStripe } from '@/lib/stripe'
import prisma, { Prisma } from '@/lib/prisma'
import type { Stripe } from 'stripe'
import { sendTicketEmail } from '@/lib/send-ticket-email'

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
    event = getStripe().webhooks.constructEvent(
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

    const createdTickets: { code: string; ticketTypeName: string }[] = []

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          event: { include: { venue: true } },
        },
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
          const code = generateTicketCode()
          await tx.ticket.create({
            data: {
              code,
              orderId: order.id,
              ticketTypeId: item.ticketTypeId,
            },
          })
          createdTickets.push({ code, ticketTypeName: tt.name })
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      })

      const totalPaid = Number(order.total)
      const pointsToEarn = Math.floor(totalPaid)

      // Staff and admins do not earn points for ticket purchases
      if (pointsToEarn > 0 && order.user.role === 'USER') {
        await tx.creditTransaction.create({
          data: {
            userId: order.userId,
            amount: pointsToEarn,
            type: 'EARN',
            description: `Puntos por compra de entradas (Order ${order.id.slice(-6)})`,
          },
        })
      }

      // Send ticket emails with QR after successful payment
      if (createdTickets.length > 0 && order.user.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        const { event, user, venue } = { event: order.event, user: order.user, venue: order.event.venue }

        for (const ticket of createdTickets) {
          const verifyUrl = `${appUrl}/staff/verify?code=${ticket.code}`
          try {
            await sendTicketEmail({
              to: user.email,
              eventTitle: event.title,
              ticketType: ticket.ticketTypeName,
              eventDate: event.startDate,
              venue: venue.name,
              city: venue.city,
              code: ticket.code,
              verifyUrl,
              userName: user.name,
            })
          } catch (err) {
            console.error(`Failed to send ticket email for ${ticket.code}:`, err)
          }
        }
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
