import { NextRequest } from 'next/server'
import type { Stripe } from 'stripe'
import { getStripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { items } = body as {
    items: { ticketTypeId: string; quantity: number }[]
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'No items provided' }, { status: 400 })
  }

  const ticketTypeIds = items.map((i: { ticketTypeId: string; quantity: number }) => i.ticketTypeId)
  const ticketTypes = await prisma.ticketType.findMany({
    where: { id: { in: ticketTypeIds } },
    include: { event: true },
  })

  if (ticketTypes.length !== ticketTypeIds.length) {
    return Response.json({ error: 'Some ticket types not found' }, { status: 404 })
  }

  for (const item of items) {
    const tt = ticketTypes.find((t: typeof ticketTypes[0]) => t.id === item.ticketTypeId)
    if (!tt) continue
    if (!tt.event.published) {
      return Response.json({ error: 'Event not available' }, { status: 400 })
    }
    if (item.quantity < 1 || item.quantity > 10) {
      return Response.json({ error: 'Invalid quantity (1-10)' }, { status: 400 })
    }
    if (tt.stock < item.quantity) {
      return Response.json(
        { error: `Not enough stock for ${tt.name}` },
        { status: 400 },
      )
    }
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item: { ticketTypeId: string; quantity: number }) => {
      const tt = ticketTypes.find((t: typeof ticketTypes[0]) => t.id === item.ticketTypeId)!
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${tt.event.title} — ${tt.name}`,
          },
          unit_amount: tt.priceCents,
        },
        quantity: item.quantity,
      }
    }
  )

  const totalCents = items.reduce((sum: number, item: { ticketTypeId: string; quantity: number }) => {
    const tt = ticketTypes.find((t: typeof ticketTypes[0]) => t.id === item.ticketTypeId)!
    return sum + tt.priceCents * item.quantity
  }, 0)

  // Create the order with line items (snapshots of name + price).
  const order = await prisma.order.create({
    data: {
      status: 'PENDING',
      fulfillmentStatus: 'PENDING',
      currency: 'eur',
      subtotalCents: totalCents,
      totalCents,
      userId: user.id,
      eventId: ticketTypes[0].eventId,
      items: {
        create: items.map((item: { ticketTypeId: string; quantity: number }) => {
          const tt = ticketTypes.find((t: typeof ticketTypes[0]) => t.id === item.ticketTypeId)!
          return {
            ticketTypeId: tt.id,
            nameSnapshot: `${tt.event.title} — ${tt.name}`,
            priceCents: tt.priceCents,
            quantity: item.quantity,
          }
        }),
      },
    },
  })

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const eventSlug = ticketTypes[0].event.slug

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${appUrl}/evento/${eventSlug}/success?order=${order.id}`,
    cancel_url: `${appUrl}/evento/${eventSlug}?canceled=1`,
    metadata: {
      orderId: order.id,
      userId: user.id,
    },
  })

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutId: session.id },
  })

  return Response.json({ url: session.url })
}
