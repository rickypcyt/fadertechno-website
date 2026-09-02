import prisma from '@/lib/prisma'

export const DEFAULT_LOYALTY_CONFIG = {
  pointsPerEuro: 10,
  qrValiditySeconds: 90,
}

export type LoyaltyConfig = {
  pointsPerEuro: number
  qrValiditySeconds: number
}

/**
 * Returns the active loyalty configuration. Ensures the single "main" row
 * exists (upsert) so the system works out of the box without manual seeding.
 */
export async function getLoyaltyConfig(): Promise<LoyaltyConfig> {
  const row = await prisma.loyaltyConfig.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main', ...DEFAULT_LOYALTY_CONFIG },
  })

  return {
    pointsPerEuro: row.pointsPerEuro,
    qrValiditySeconds: row.qrValiditySeconds,
  }
}

/**
 * Points earned for a purchase of `amountCents`.
 *
 * Formula: floor(euros) * pointsPerEuro, rounded DOWN (never rounds up).
 * e.g. 10 pts/€ → 15.99 € → 150 pts, 3 € → 30 pts.
 */
export function calculatePurchasePoints(
  amountCents: number,
  pointsPerEuro: number,
): number {
  const euros = Math.floor(amountCents / 100)
  return euros * pointsPerEuro
}
