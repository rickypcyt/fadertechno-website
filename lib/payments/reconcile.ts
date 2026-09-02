import prisma from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { fulfillOrder } from './fulfillment'

export type ReconcileResult = {
  checked: number
  fulfilled: number
  failed: number
  details: { orderId: string; action: string; ok: boolean; error?: string }[]
}

/**
 * Manual reconciliation: scans orders that are not in a terminal state
 * (PENDING, PROCESSING, FULFILLMENT_ERROR), checks their status in Stripe,
 * and triggers fulfillment if the payment is confirmed.
 *
 * Safe to run repeatedly — fulfillOrder() is idempotent.
 */
export async function reconcileOrders(): Promise<ReconcileResult> {
  const stuckOrders = await prisma.order.findMany({
    where: {
      status: { in: ['PENDING', 'PROCESSING', 'PAYMENT_FAILED'] },
      stripeCheckoutId: { not: null },
    },
    take: 50,
    orderBy: { createdAt: 'asc' },
  })

  const errorOrders = await prisma.order.findMany({
    where: { fulfillmentStatus: 'ERROR' },
    take: 50,
    orderBy: { updatedAt: 'asc' },
  })

  const allOrders = [...stuckOrders, ...errorOrders]
  const seen = new Set<string>()
  const details: ReconcileResult['details'] = []
  let fulfilled = 0
  let failed = 0

  for (const order of allOrders) {
    if (seen.has(order.id)) continue
    seen.add(order.id)

    try {
      // Check Stripe payment status.
      const stripe = getStripe()
      const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutId!)
      const isPaid = session.payment_status === 'paid'

      if (isPaid) {
        const result = await fulfillOrder(order.id)
        if (result.ok) {
          fulfilled++
          details.push({ orderId: order.id, action: 'fulfilled', ok: true })
        } else {
          failed++
          details.push({ orderId: order.id, action: 'fulfill_failed', ok: false, error: result.error })
        }
      } else if (session.status === 'expired') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAYMENT_FAILED' },
        })
        details.push({ orderId: order.id, action: 'marked_payment_failed', ok: true })
      } else {
        details.push({ orderId: order.id, action: 'still_pending_in_stripe', ok: true })
      }
    } catch (err) {
      failed++
      const message = err instanceof Error ? err.message : 'Reconcile error'
      details.push({ orderId: order.id, action: 'error', ok: false, error: message })
    }
  }

  return {
    checked: allOrders.length,
    fulfilled,
    failed,
    details,
  }
}
