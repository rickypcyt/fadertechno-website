import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getLoyaltyConfig, DEFAULT_LOYALTY_CONFIG } from '@/lib/loyalty'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const config = await getLoyaltyConfig()
  return Response.json(config)
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = (await request.json()) as {
    pointsPerEuro?: number
    qrValiditySeconds?: number
  }

  const data: Record<string, number> = {}
  if (body.pointsPerEuro !== undefined) {
    if (!Number.isInteger(body.pointsPerEuro) || body.pointsPerEuro <= 0) {
      return Response.json({ error: 'pointsPerEuro debe ser un entero positivo' }, { status: 400 })
    }
    data.pointsPerEuro = body.pointsPerEuro
  }
  if (body.qrValiditySeconds !== undefined) {
    if (!Number.isInteger(body.qrValiditySeconds) || body.qrValiditySeconds < 10) {
      return Response.json({ error: 'qrValiditySeconds debe ser un entero >= 10' }, { status: 400 })
    }
    data.qrValiditySeconds = body.qrValiditySeconds
  }

  if (Object.keys(data).length === 0) {
    return Response.json(DEFAULT_LOYALTY_CONFIG)
  }

  const config = await prisma.loyaltyConfig.upsert({
    where: { id: 'main' },
    update: data,
    create: { id: 'main', ...DEFAULT_LOYALTY_CONFIG, ...data },
  })

  return Response.json({
    pointsPerEuro: config.pointsPerEuro,
    qrValiditySeconds: config.qrValiditySeconds,
  })
}
