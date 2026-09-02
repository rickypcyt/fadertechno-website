import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = (await request.json()) as {
    name?: string
    description?: string
    pointsCost?: number
    salePriceCents?: number | null
    realCostCents?: number | null
    stock?: number | null
    maxPerUser?: number | null
    maxPerEvent?: number | null
    active?: boolean
  }

  if (!body.name || body.pointsCost === undefined || body.pointsCost === null) {
    return Response.json({ error: 'Faltan campos obligatorios (name, pointsCost)' }, { status: 400 })
  }
  if (body.pointsCost <= 0) {
    return Response.json({ error: 'pointsCost debe ser mayor que 0' }, { status: 400 })
  }

  const reward = await prisma.reward.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      pointsCost: Math.floor(body.pointsCost),
      salePriceCents: body.salePriceCents ?? null,
      realCostCents: body.realCostCents ?? null,
      stock: body.stock ?? null,
      maxPerUser: body.maxPerUser ?? null,
      maxPerEvent: body.maxPerEvent ?? null,
      active: body.active ?? true,
    },
  })

  return Response.json({ id: reward.id })
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = (await request.json()) as {
    id?: string
    name?: string
    description?: string | null
    pointsCost?: number
    salePriceCents?: number | null
    realCostCents?: number | null
    stock?: number | null
    maxPerUser?: number | null
    maxPerEvent?: number | null
    active?: boolean
  }

  if (!body.id) {
    return Response.json({ error: 'Falta id' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.description !== undefined) data.description = body.description
  if (body.pointsCost !== undefined) data.pointsCost = Math.floor(body.pointsCost)
  if (body.salePriceCents !== undefined) data.salePriceCents = body.salePriceCents
  if (body.realCostCents !== undefined) data.realCostCents = body.realCostCents
  if (body.stock !== undefined) data.stock = body.stock
  if (body.maxPerUser !== undefined) data.maxPerUser = body.maxPerUser
  if (body.maxPerEvent !== undefined) data.maxPerEvent = body.maxPerEvent
  if (body.active !== undefined) data.active = body.active

  await prisma.reward.update({ where: { id: body.id }, data })

  return Response.json({ success: true })
}
