import { getStripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { inngest } from '@/lib/inngest'
import { refundOrder } from '@/lib/payments/fulfillment'
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
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    })
  }

  // Idempotency layer 1: check if we've already processed this Stripe event.
  const existing = await prisma.stripeWebhookEvent.findUnique({
    where: { stripeEventId: event.id },
  })

  if (existing?.processed) {
    // Already processed — acknowledge and exit.
    return new Response('OK', { status: 200 })
  }

  // Record the event (or update attempts if it exists but wasn't processed).
  await prisma.stripeWebhookEvent.upsert({
    where: { stripeEventId: event.id },
    update: { attempts: { increment: 1 } },
    create: {
      stripeEventId: event.id,
      type: event.type,
      attempts: 1,
    },
  })

  try {
    await processEvent(event)
    await prisma.stripeWebhookEvent.update({
      where: { stripeEventId: event.id },
      data: { processed: true, processedAt: new Date() },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Processing error'
    await prisma.stripeWebhookEvent.update({
      where: { stripeEventId: event.id },
      data: { error: message },
    })
    // Return 500 so Stripe retries.
    return new Response(`Processing error: ${message}`, { status: 500 })
  }

  return new Response('OK', { status: 200 })
}

async function processEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId
      if (!orderId) return

      // Enqueue the fulfillment job — the webhook stays fast.
      await inngest.send({ name: 'order/fulfill', data: { orderId } })
      break
    }

    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId
      if (!orderId) return

      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAYMENT_FAILED' },
      })
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const orderId = charge.metadata?.orderId
      if (!orderId) return

      const order = await prisma.order.findUnique({ where: { id: orderId } })
      if (!order) return

      // Calculate points to revoke based on refund amount.
      const refundCents = charge.amount_refunded
      const { getLoyaltyConfig, calculatePurchasePoints } = await import('@/lib/loyalty')
      const { pointsPerEuro } = await getLoyaltyConfig()
      const pointsToRevoke = calculatePurchasePoints(refundCents, pointsPerEuro)

      await refundOrder(orderId, pointsToRevoke)

      // Update order status for partial refunds.
      if (charge.amount_refunded < charge.amount) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PARTIALLY_REFUNDED' },
        })
      }
      break
    }

    default:
      // Unhandled event type — acknowledge but don't process.
      break
  }
}
