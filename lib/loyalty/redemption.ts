import crypto from 'crypto'
import prisma, { Prisma } from '@/lib/prisma'
import { getLoyaltyConfig } from './config'
import { getPointsBalanceTx } from './balance'
import { getReward } from './rewards'

export type RedemptionResult =
  | {
      ok: true
      redemptionId: string
      token: string
      pointsSpent: number
      expiresAt: Date
    }
  | { ok: false; error: RedemptionError }

export type RedemptionError =
  | 'not_found'
  | 'inactive'
  | 'out_of_stock'
  | 'insufficient_points'
  | 'max_per_user'
  | 'max_per_event'

/**
 * User-initiated redemption. Runs entirely inside a DB transaction:
 *
 * 1. Load reward (lock via update on a no-op? Prisma has no SELECT FOR UPDATE;
 *    we rely on the transaction isolation + the atomic status flip at the bar
 *    for the real concurrency guard).
 * 2. Check balance >= pointsCost.
 * 3. Create the -points movement (REWARD_REDEMPTION, referenceId = redemption id).
 * 4. Create the RewardRedemption (PENDING) with a random token + expiry.
 *
 * Points are deducted up-front. If the QR expires, the points are returned via
 * an EXPIRATION movement (see `expireRedemption`), keeping the ledger auditable.
 */
export async function createRewardRedemption(
  userId: string,
  rewardId: string,
): Promise<RedemptionResult> {
  const config = await getLoyaltyConfig()

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const reward = await tx.reward.findUnique({ where: { id: rewardId } })

    if (!reward) return { ok: false, error: 'not_found' } as const
    if (!reward.active) return { ok: false, error: 'inactive' } as const
    if (reward.stock !== null && reward.stock <= 0) {
      return { ok: false, error: 'out_of_stock' } as const
    }

    // Per-user limit (counts all non-cancelled redemptions).
    if (reward.maxPerUser !== null) {
      const userCount = await tx.rewardRedemption.count({
        where: { userId, rewardId, status: { in: ['PENDING', 'REDEEMED'] } },
      })
      if (userCount >= reward.maxPerUser) {
        return { ok: false, error: 'max_per_user' } as const
      }
    }

    // Per-event limit (currently global across the reward; event scoping can be
    // added later by linking redemptions to an event/check-in).
    if (reward.maxPerEvent !== null) {
      const eventCount = await tx.rewardRedemption.count({
        where: { rewardId, status: { in: ['PENDING', 'REDEEMED'] } },
      })
      if (eventCount >= reward.maxPerEvent) {
        return { ok: false, error: 'max_per_event' } as const
      }
    }

    const balance = await getPointsBalanceTx(tx, userId)
    if (balance < reward.pointsCost) {
      return { ok: false, error: 'insufficient_points' } as const
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(
      Date.now() + config.qrValiditySeconds * 1000,
    )

    const redemption = await tx.rewardRedemption.create({
      data: {
        userId,
        rewardId: reward.id,
        pointsSpent: reward.pointsCost,
        token,
        status: 'PENDING',
        expiresAt,
      },
    })

    await tx.pointTransaction.create({
      data: {
        userId,
        points: -reward.pointsCost,
        type: 'REWARD_REDEMPTION',
        referenceId: redemption.id,
        description: `Canje: ${reward.name}`,
      },
    })

    if (reward.stock !== null) {
      await tx.reward.update({
        where: { id: reward.id },
        data: { stock: { decrement: 1 } },
      })
    }

    return {
      ok: true,
      redemptionId: redemption.id,
      token,
      pointsSpent: reward.pointsCost,
      expiresAt,
    } as const
  })
}

export type BarRedeemResult =
  | {
      ok: true
      redemptionId: string
      rewardName: string
      pointsSpent: number
      redeemedAt: Date
      user: { name: string | null; email: string }
    }
  | { ok: false; error: BarRedeemError; message: string }

export type BarRedeemError =
  | 'not_found'
  | 'already_redeemed'
  | 'expired'
  | 'cancelled'
  | 'reward_inactive'

/**
 * Bar/staff scan. Atomically flips PENDING → REDEEMED. Safe against double-scan
 * because the status check + update happen in a single transaction; a second
 * concurrent scan will see REDEEMED.
 */
export async function redeemRewardAtBar(
  token: string,
): Promise<BarRedeemResult> {
  if (!token) {
    return { ok: false, error: 'not_found', message: 'Token requerido' } as const
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const redemption = await tx.rewardRedemption.findUnique({
      where: { token },
      include: { reward: true, user: true },
    })

    if (!redemption) {
      return {
        ok: false,
        error: 'not_found',
        message: 'Código no encontrado',
      } as const
    }

    if (redemption.status === 'REDEEMED') {
      return {
        ok: false,
        error: 'already_redeemed',
        message: 'Recompensa ya canjeada',
      } as const
    }
    if (redemption.status === 'CANCELLED') {
      return {
        ok: false,
        error: 'cancelled',
        message: 'Canje cancelado',
      } as const
    }
    if (redemption.status === 'EXPIRED' || redemption.expiresAt < new Date()) {
      // Normalise stale PENDING rows that passed their expiry.
      if (redemption.status === 'PENDING') {
        await tx.rewardRedemption.update({
          where: { id: redemption.id },
          data: { status: 'EXPIRED' },
        })
        await refundExpiredRedemption(tx, redemption.id, redemption.userId, redemption.pointsSpent, redemption.reward.name)
      }
      return {
        ok: false,
        error: 'expired',
        message: 'El código ha caducado',
      } as const
    }
    if (!redemption.reward.active) {
      return {
        ok: false,
        error: 'reward_inactive',
        message: 'La recompensa ya no está activa',
      } as const
    }

    const redeemedAt = new Date()
    await tx.rewardRedemption.update({
      where: { id: redemption.id },
      data: { status: 'REDEEMED', redeemedAt },
    })

    return {
      ok: true,
      redemptionId: redemption.id,
      rewardName: redemption.reward.name,
      pointsSpent: redemption.pointsSpent,
      redeemedAt,
      user: {
        name: redemption.user.name,
        email: redemption.user.email,
      },
    } as const
  })
}

/**
 * Returns the spent points to the user when a redemption expires. Creates an
 * EXPIRATION movement referenced to the original redemption so the ledger stays
 * auditable. Idempotent via the unique([type, referenceId]) constraint.
 */
async function refundExpiredRedemption(
  tx: Prisma.TransactionClient,
  redemptionId: string,
  userId: string,
  pointsSpent: number,
  rewardName: string,
): Promise<void> {
  await tx.pointTransaction.create({
    data: {
      userId,
      points: pointsSpent,
      type: 'EXPIRATION',
      referenceId: redemptionId,
      description: `Devolución por expiración: ${rewardName}`,
    },
  })
}

/**
 * Expires all PENDING redemptions past their expiry time and refunds their
 * points. Intended to run periodically (e.g. on bar scan or a cron). Safe to
 * call repeatedly thanks to the unique constraint on EXPIRATION movements.
 */
export async function expireStaleRedemptions(): Promise<number> {
  const stale = await prisma.rewardRedemption.findMany({
    where: { status: 'PENDING', expiresAt: { lt: new Date() } },
    include: { reward: true },
    take: 200,
  })

  if (stale.length === 0) return 0

  for (const r of stale) {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.rewardRedemption.update({
        where: { id: r.id },
        data: { status: 'EXPIRED' },
      })
      await refundExpiredRedemption(tx, r.id, r.userId, r.pointsSpent, r.reward.name)
      if (r.reward.stock !== null) {
        await tx.reward.update({
          where: { id: r.rewardId },
          data: { stock: { increment: 1 } },
        })
      }
    })
  }

  return stale.length
}

/**
 * Refund points for a purchase (e.g. when Stripe issues a refund). Creates a
 * REFUND movement referenced to the order. Idempotent: a second call for the
 * same order is a no-op thanks to the unique constraint.
 *
 * If the user already spent the points, the balance goes negative — by design,
 * so they must earn points again before redeeming.
 */
export async function refundPurchasePoints(
  userId: string,
  orderId: string,
  points: number,
): Promise<void> {
  if (points <= 0) return
  await prisma.pointTransaction.create({
    data: {
      userId,
      points: -points,
      type: 'REFUND',
      referenceId: orderId,
      description: `Reembolso de compra (Order ${orderId.slice(-6)})`,
    },
  })
}

/** Award purchase points. Idempotent via unique([type, referenceId]). */
export async function awardPurchasePoints(
  tx: Prisma.TransactionClient,
  userId: string,
  orderId: string,
  points: number,
): Promise<void> {
  if (points <= 0) return
  await tx.pointTransaction.create({
    data: {
      userId,
      points,
      type: 'PURCHASE',
      referenceId: orderId,
      description: `Puntos por compra (Order ${orderId.slice(-6)})`,
    },
  })
}

export { getReward }
