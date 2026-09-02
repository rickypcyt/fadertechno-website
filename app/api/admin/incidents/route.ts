import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { fulfillOrder } from '@/lib/payments/fulfillment'
import { reconcileOrders } from '@/lib/payments/reconcile'

export const dynamic = 'force-dynamic'

/** GET: list orders with fulfillment errors or stuck states. */
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const [errorOrders, stuckOrders, failedWebhooks] = await Promise.all([
    prisma.order.findMany({
      where: { fulfillmentStatus: 'ERROR' },
      include: { user: true, event: true, items: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'PROCESSING', 'PAYMENT_FAILED'] },
        createdAt: { lt: new Date(Date.now() - 15 * 60 * 1000) },
      },
      include: { user: true, event: true },
      orderBy: { createdAt: 'asc' },
      take: 20,
    }),
    prisma.stripeWebhookEvent.count({
      where: { processed: false, error: { not: null } },
    }),
  ])

  return Response.json({
    errorOrders: errorOrders.map((o) => ({
      id: o.id,
      status: o.status,
      fulfillmentStatus: o.fulfillmentStatus,
      fulfillmentError: o.fulfillmentError,
      totalCents: o.totalCents,
      createdAt: o.createdAt,
      user: { name: o.user.name, email: o.user.email },
      event: { title: o.event.title },
    })),
    stuckOrders: stuckOrders.map((o) => ({
      id: o.id,
      status: o.status,
      totalCents: o.totalCents,
      createdAt: o.createdAt,
      user: { name: o.user.name, email: o.user.email },
      event: { title: o.event.title },
    })),
    failedWebhooks,
  })
}

/** POST: retry fulfillment for a specific order, or run reconciliation. */
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = (await request.json()) as { action: 'retry' | 'reconcile'; orderId?: string }

  if (body.action === 'reconcile') {
    const result = await reconcileOrders()
    return Response.json(result)
  }

  if (body.action === 'retry' && body.orderId) {
    const result = await fulfillOrder(body.orderId)
    return Response.json(result, { status: result.ok ? 200 : 400 })
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 })
}
