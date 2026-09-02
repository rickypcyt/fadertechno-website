import { getCurrentUser } from '@/lib/auth'
import { createRewardRedemption, expireStaleRedemptions } from '@/lib/loyalty'

export const dynamic = 'force-dynamic'

// Error messages keyed by the RedemptionError union.
const ERROR_MESSAGES: Record<string, string> = {
  not_found: 'Recompensa no encontrada.',
  inactive: 'Esta recompensa ya no está disponible.',
  out_of_stock: 'Recompensa agotada.',
  insufficient_points: 'No tienes puntos suficientes.',
  max_per_user: 'Has alcanzado el máximo de canjes para esta recompensa.',
  max_per_event: 'Se ha alcanzado el máximo de canjes para esta recompensa.',
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.role !== 'USER') {
    return Response.json({ error: 'Los puntos solo se canjean desde cuentas de usuario.' }, { status: 403 })
  }

  const { rewardId } = (await request.json()) as { rewardId?: string }
  if (!rewardId) {
    return Response.json({ error: 'Falta rewardId' }, { status: 400 })
  }

  // Clean up expired redemptions (refunds their points) before redeeming so the
  // user sees an up-to-date balance.
  await expireStaleRedemptions()

  const result = await createRewardRedemption(user.id, rewardId)

  if (!result.ok) {
    return Response.json(
      { error: ERROR_MESSAGES[result.error] ?? 'No se pudo canjear.' },
      { status: 400 },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const redeemUrl = `${appUrl}/redeem/${result.token}`

  return Response.json({
    redemptionId: result.redemptionId,
    token: result.token,
    pointsSpent: result.pointsSpent,
    expiresAt: result.expiresAt.toISOString(),
    redeemUrl,
  })
}
