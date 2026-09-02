import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import { getLoyaltyConfig } from '@/lib/loyalty'
import RewardForm from '@/app/components/admin/RewardForm'
import LoyaltyConfigForm from '@/app/components/admin/LoyaltyConfigForm'

export const dynamic = 'force-dynamic'

export default async function AdminRewardsPage() {
  await requireRole('ADMIN')
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.rewards
  const config = await getLoyaltyConfig()

  const [rewards, loyaltyUsers, activeUsers, pointsGenerated, pointsRedeemed, pendingRedemptions, redeemedWithReward] =
    await Promise.all([
      prisma.reward.findMany({ orderBy: { pointsCost: 'asc' } }),
      prisma.pointTransaction.groupBy({
        by: ['userId'],
        _sum: { points: true },
        having: { points: { _sum: { gt: 0 } } },
      }),
      prisma.user.count({
        where: { pointTransactions: { some: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } } },
      }),
      prisma.pointTransaction.aggregate({
        where: { type: 'PURCHASE' },
        _sum: { points: true },
      }),
      prisma.pointTransaction.aggregate({
        where: { type: 'REWARD_REDEMPTION' },
        _sum: { points: true },
      }),
      prisma.rewardRedemption.count({ where: { status: 'PENDING' } }),
      prisma.rewardRedemption.findMany({
        where: { status: 'REDEEMED' },
        include: { reward: true },
      }),
    ])

  const realCostCents = redeemedWithReward.reduce(
    (sum, r) => sum + (r.reward.realCostCents ?? 0),
    0,
  )

  // Redemptions grouped by reward
  const byReward = new Map<string, { name: string; count: number; realCostCents: number }>()
  for (const r of redeemedWithReward) {
    const key = r.rewardId
    const entry = byReward.get(key) ?? { name: r.reward.name, count: 0, realCostCents: 0 }
    entry.count += 1
    entry.realCostCents += r.reward.realCostCents ?? 0
    byReward.set(key, entry)
  }
  const redemptionsByReward = Array.from(byReward.values()).sort((a, b) => b.count - a.count)

  return (
    <div className="admin-page">
      <h1>{t.title}</h1>

      {/* Loyalty config */}
      <div className="admin-card" style={{ marginTop: '24px', marginBottom: '24px' }}>
        <div className="admin-card-label">{t.loyaltyConfig}</div>
        <LoyaltyConfigForm dict={dict} initialConfig={config} />
      </div>

      {/* Metrics */}
      <h2 style={{ fontSize: '1.1rem', marginTop: '32px', marginBottom: '16px' }}>
        {t.metrics}
      </h2>
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-label">{t.loyaltyUsers}</div>
          <div className="admin-card-value">{loyaltyUsers.length}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">{t.activeUsers}</div>
          <div className="admin-card-value">{activeUsers}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">{t.pointsGenerated}</div>
          <div className="admin-card-value">{pointsGenerated._sum.points ?? 0}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">{t.pointsRedeemed}</div>
          <div className="admin-card-value">{Math.abs(pointsRedeemed._sum.points ?? 0)}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">{t.pointsPending}</div>
          <div className="admin-card-value">{pendingRedemptions}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">{t.realCostTotal}</div>
          <div className="admin-card-value">{(realCostCents / 100).toFixed(2)} €</div>
        </div>
      </div>

      {redemptionsByReward.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginTop: '32px', marginBottom: '16px' }}>
            {t.redemptionsByReward}
          </h2>
          <div className="admin-list">
            {redemptionsByReward.map((r) => (
              <div key={r.name} className="admin-list-item">
                <div>
                  <strong>{r.name}</strong>
                  <div className="text-dim" style={{ fontSize: '1rem' }}>
                    {r.count} {t.redemptions} · {(r.realCostCents / 100).toFixed(2)} €
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Rewards CRUD */}
      <div className="admin-page-header" style={{ marginTop: '40px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem' }}>{t.title}</h2>
        </div>
        <RewardForm dict={dict} />
      </div>

      <div className="admin-list" style={{ marginTop: '16px' }}>
        {rewards.length === 0 ? (
          <p className="text-dim">{t.empty}</p>
        ) : (
          rewards.map((r) => (
            <div key={r.id} className="admin-list-item">
              <div>
                <div>
                  <strong>{r.name}</strong>
                  {!r.active && (
                    <span className="admin-badge muted" style={{ marginLeft: '8px' }}>
                      {dict.panel.common.inactive}
                    </span>
                  )}
                </div>
                {r.description && (
                  <div className="text-dim" style={{ fontSize: '1rem' }}>{r.description}</div>
                )}
                <div className="text-dim" style={{ fontSize: '1rem' }}>
                  {t.pointsCost.replace('{cost}', String(r.pointsCost))}
                  {r.stock !== null ? ` · ${dict.panel.common.stock}: ${r.stock}` : ''}
                  {r.salePriceCents !== null
                    ? ` · ${t.salePrice.replace('{price}', (r.salePriceCents / 100).toFixed(2))}`
                    : ''}
                </div>
              </div>
              <div className="admin-actions">
                <RewardForm dict={dict} reward={{
                  id: r.id,
                  name: r.name,
                  description: r.description,
                  pointsCost: r.pointsCost,
                  salePriceCents: r.salePriceCents,
                  realCostCents: r.realCostCents,
                  stock: r.stock,
                  maxPerUser: r.maxPerUser,
                  maxPerEvent: r.maxPerEvent,
                  active: r.active,
                }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
