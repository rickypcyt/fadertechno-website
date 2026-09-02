import prisma, { Prisma } from '@/lib/prisma'

/**
 * Returns the user's current points balance, computed from the ledger.
 * Positive and negative movements are summed; balance may go negative when a
 * refund is issued for points that were already spent.
 */
export async function getPointsBalance(userId: string): Promise<number> {
  const result = await prisma.pointTransaction.aggregate({
    where: { userId },
    _sum: { points: true },
  })
  return result._sum.points ?? 0
}

/**
 * Balance computed inside an ongoing transaction (so redemptions see a
 * consistent view of the ledger).
 */
export async function getPointsBalanceTx(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<number> {
  const result = await tx.pointTransaction.aggregate({
    where: { userId },
    _sum: { points: true },
  })
  return result._sum.points ?? 0
}

export type PointTransactionRow = {
  id: string
  points: number
  type: string
  description: string | null
  createdAt: Date
}

export async function getPointTransactions(
  userId: string,
  limit = 100,
): Promise<PointTransactionRow[]> {
  const rows = await prisma.pointTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return rows.map((r) => ({
    id: r.id,
    points: r.points,
    type: r.type,
    description: r.description,
    createdAt: r.createdAt,
  }))
}
