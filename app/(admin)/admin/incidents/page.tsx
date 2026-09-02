import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import IncidentsClient from '@/app/components/admin/IncidentsClient'

export const dynamic = 'force-dynamic'

export default async function AdminIncidentsPage() {
  await requireRole('ADMIN')
  const dict = await getDictionary(defaultLocale)

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

  return (
    <IncidentsClient
      dict={dict}
      errorOrders={errorOrders.map((o) => ({
        id: o.id,
        status: o.status,
        fulfillmentStatus: o.fulfillmentStatus,
        fulfillmentError: o.fulfillmentError,
        totalCents: o.totalCents,
        createdAt: o.createdAt.toISOString(),
        user: { name: o.user.name, email: o.user.email },
        event: { title: o.event.title },
      }))}
      stuckOrders={stuckOrders.map((o) => ({
        id: o.id,
        status: o.status,
        totalCents: o.totalCents,
        createdAt: o.createdAt.toISOString(),
        user: { name: o.user.name, email: o.user.email },
        event: { title: o.event.title },
      }))}
      failedWebhooks={failedWebhooks}
    />
  )
}
