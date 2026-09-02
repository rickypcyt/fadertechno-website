import prisma, { Prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { inngest, type FulfillOrderEvent } from '@/lib/inngest'
import { getLoyaltyConfig, calculatePurchasePoints, awardPurchasePoints } from '@/lib/loyalty'
import { sendTicketEmail } from '@/lib/send-ticket-email'
import type { Stripe } from 'stripe'

/**
 * Idempotent order fulfillment. Designed to be called from:
 *   - the Stripe webhook (via Inngest job)
 *   - the admin "retry" button
 *   - the reconciliation process
 *
 * Each step checks whether it has already been done before executing, so
 * repeated calls converge to the correct state without duplicating tickets,
 * points, or emails.
 *
 * Payment status and fulfillment status are tracked separately:
 *   - Order.status: payment lifecycle (PENDING → PAID → REFUNDED…)
 *   - Order.fulfillmentStatus: delivery lifecycle (PENDING → COMPLETED / ERROR)
 *
 * If a step fails, the order is marked FULFILLMENT_ERROR with a message and
 * can be retried. The payment is never re-charged.
 */
export async function fulfillOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      event: { include: { venue: true } },
      items: { include: { ticketType: true } },
      tickets: true,
    },
  })

  if (!order) return { ok: false, error: 'Order not found' }

  // Already fully fulfilled — nothing to do.
  if (order.fulfillmentStatus === 'COMPLETED') return { ok: true }

  try {
    // Step 1: Confirm payment with Stripe if not already PAID.
    let paymentConfirmed = order.status === 'PAID'
    let stripePaymentId = order.stripePaymentId

    if (!paymentConfirmed && order.stripeCheckoutId) {
      const stripe = getStripe()
      const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutId)
      stripePaymentId = session.payment_intent as string | null ?? stripePaymentId

      if (session.payment_status === 'paid') {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            stripePaymentId,
          },
        })
        paymentConfirmed = true
      } else if (session.payment_status === 'unpaid' && session.status === 'expired') {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAYMENT_FAILED' },
        })
        return { ok: false, error: 'Payment not completed' }
      }
    }

    if (!paymentConfirmed) {
      return { ok: false, error: 'Payment not confirmed yet' }
    }

    // Step 2: Decrement stock (idempotent — only if not already done).
    // We track this by checking if tickets already exist for this order.
    if (order.tickets.length === 0) {
      for (const item of order.items) {
        if (item.ticketTypeId) {
          await prisma.ticketType.update({
            where: { id: item.ticketTypeId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }
    }

    // Step 3: Create tickets (idempotent — only if not already created).
    const existingTickets = order.tickets
    const totalExpected = order.items.reduce((s, i) => s + i.quantity, 0)

    if (existingTickets.length < totalExpected) {
      const createdTickets: { code: string; ticketTypeName: string }[] = []

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        for (const item of order.items) {
          const tt = item.ticketType
          if (!tt) continue

          for (let i = 0; i < item.quantity; i++) {
            const code = generateTicketCode()
            await tx.ticket.create({
              data: {
                code,
                status: 'VALID',
                nameSnapshot: item.nameSnapshot,
                priceCents: item.priceCents,
                orderId: order.id,
                ticketTypeId: item.ticketTypeId!,
              },
            })
            createdTickets.push({ code, ticketTypeName: item.nameSnapshot })
          }
        }

        // Step 4: Award points (idempotent via unique([PURCHASE, orderId])).
        const { pointsPerEuro } = await getLoyaltyConfig()
        const pointsToEarn = calculatePurchasePoints(order.totalCents, pointsPerEuro)

        if (pointsToEarn > 0 && order.user.role === 'USER') {
          await awardPurchasePoints(tx, order.userId, order.id, pointsToEarn)
        }

        // Mark fulfillment completed.
        await tx.order.update({
          where: { id: orderId },
          data: {
            fulfillmentStatus: 'COMPLETED',
            fulfilledAt: new Date(),
            fulfillmentError: null,
          },
        })
      })

      // Step 5: Send ticket emails (best-effort, outside the transaction).
      // Email failures don't block fulfillment — the order is already COMPLETED.
      if (createdTickets.length > 0 && order.user.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        for (const ticket of createdTickets) {
          const verifyUrl = `${appUrl}/staff/verify?code=${ticket.code}`
          try {
            await sendTicketEmail({
              to: order.user.email,
              eventTitle: order.event.title,
              ticketType: ticket.ticketTypeName,
              eventDate: order.event.startDate,
              venue: order.event.venue.name,
              city: order.event.venue.city,
              code: ticket.code,
              verifyUrl,
              userName: order.user.name,
            })
          } catch (err) {
            console.error(`Failed to send ticket email for ${ticket.code}:`, err)
          }
        }
      }
    } else {
      // Tickets already exist — just ensure points + fulfillment are marked.
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const { pointsPerEuro } = await getLoyaltyConfig()
        const pointsToEarn = calculatePurchasePoints(order.totalCents, pointsPerEuro)

        if (pointsToEarn > 0 && order.user.role === 'USER') {
          await awardPurchasePoints(tx, order.userId, order.id, pointsToEarn)
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            fulfillmentStatus: 'COMPLETED',
            fulfilledAt: new Date(),
            fulfillmentError: null,
          },
        })
      })
    }

    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown fulfillment error'
    await prisma.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: 'ERROR',
        fulfillmentError: message,
      },
    })
    return { ok: false, error: message }
  }
}

/**
 * Inngest function that runs fulfillOrder() as a durable, retried background
 * job. Triggered by the 'order/fulfill' event from the Stripe webhook.
 */
export const fulfillOrderFunction = inngest.createFunction(
  {
    id: 'fulfill-order',
    retries: 3,
    triggers: [{ event: 'order/fulfill' }],
  },
  async ({ event, step }: { event: { data: FulfillOrderEvent['data'] }; step: any }) => {
    const { orderId } = event.data

    const result = await step.run('fulfill', async () => {
      return fulfillOrder(orderId)
    })

    if (!result.ok) {
      throw new Error(result.error ?? 'Fulfillment failed')
    }

    return { orderId, ok: true }
  },
)

function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `FC-${code}`
}

/**
 * Refund an order: reverse points and mark tickets as REFUNDED.
 * Called when Stripe reports a refund. Idempotent via unique([REFUND, orderId]).
 */
export async function refundOrder(
  orderId: string,
  pointsToRevoke: number,
): Promise<void> {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { tickets: true },
    })
    if (!order) return

    // Reverse points (idempotent).
    if (pointsToRevoke > 0) {
      await tx.pointTransaction.create({
        data: {
          userId: order.userId,
          points: -pointsToRevoke,
          type: 'REFUND',
          referenceId: orderId,
          description: `Reembolso de compra (Order ${orderId.slice(-6)})`,
        },
      }).catch(() => {
        // Unique constraint violation = already refunded, ignore.
      })
    }

    // Mark tickets as REFUNDED.
    await tx.ticket.updateMany({
      where: { orderId, status: { in: ['VALID', 'ISSUED'] } },
      data: { status: 'REFUNDED' },
    })

    // Update order status.
    const wasFullyRefunded = order.status === 'PAID'
    await tx.order.update({
      where: { id: orderId },
      data: { status: wasFullyRefunded ? 'REFUNDED' : order.status },
    })
  })
}
