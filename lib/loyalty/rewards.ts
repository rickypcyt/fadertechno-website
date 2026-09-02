import prisma from '@/lib/prisma'

export type RewardRow = {
  id: string
  name: string
  description: string | null
  pointsCost: number
  salePriceCents: number | null
  stock: number | null
  active: boolean
  maxPerUser: number | null
  maxPerEvent: number | null
}

/** Active rewards visible to users, cheapest first. */
export async function getAvailableRewards(): Promise<RewardRow[]> {
  const rewards = await prisma.reward.findMany({
    where: { active: true },
    orderBy: { pointsCost: 'asc' },
  })
  return rewards.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    pointsCost: r.pointsCost,
    salePriceCents: r.salePriceCents,
    stock: r.stock,
    active: r.active,
    maxPerUser: r.maxPerUser,
    maxPerEvent: r.maxPerEvent,
  }))
}

export async function getReward(id: string) {
  return prisma.reward.findUnique({ where: { id } })
}
