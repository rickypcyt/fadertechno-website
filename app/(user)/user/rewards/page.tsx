import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import { getPointsBalance, getPointTransactions, getAvailableRewards, getLoyaltyConfig } from '@/lib/loyalty'
import RewardsClient from '@/app/components/user/RewardsClient'

export const dynamic = 'force-dynamic'

export default async function UserRewardsPage() {
  const user = await requireRole(Role.USER)
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.userRewards

  const [balance, transactions, rewards, config] = await Promise.all([
    getPointsBalance(user.id),
    getPointTransactions(user.id, 100),
    getAvailableRewards(),
    getLoyaltyConfig(),
  ])

  // Next reward the user is progressing towards (cheapest they can't yet afford,
  // or the first one they can afford if they can afford all).
  const nextReward = rewards.find((r) => balance < r.pointsCost) ?? rewards[rewards.length - 1]
  const progressPct =
    nextReward && nextReward.pointsCost > 0
      ? Math.min(100, Math.round((balance / nextReward.pointsCost) * 100))
      : 100

  return (
    <div className="admin-page">
      <h1 style={{ fontSize: '1.3rem' }}>{t.title}</h1>
      <p className="text-dim">{t.subtitle}</p>

      {/* Balance + progress */}
      <div className="admin-card" style={{ marginTop: '32px', marginBottom: '32px' }}>
        <div className="admin-card-label">{t.balance}</div>
        <div className="admin-card-value">{balance.toLocaleString('es-ES')}</div>
        {nextReward && balance < nextReward.pointsCost && (
          <>
            <div className="event-card-bar-track" style={{ marginTop: '16px' }}>
              <div className="event-card-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-dim" style={{ fontSize: '1rem', marginTop: '8px' }}>
              {t.progressTo
                .replace('{amount}', String(nextReward.pointsCost - balance))
                .replace('{reward}', nextReward.name)}
            </div>
          </>
        )}
      </div>

      {/* Rewards */}
      <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>{t.available}</h2>
      {rewards.length === 0 ? (
        <p className="text-dim">{t.empty}</p>
      ) : (
        <RewardsClient
          dict={dict}
          rewards={rewards.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            pointsCost: r.pointsCost,
            stock: r.stock,
          }))}
          balance={balance}
          qrValiditySeconds={config.qrValiditySeconds}
        />
      )}

      {/* History */}
      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>{t.history}</h2>
      {transactions.length === 0 ? (
        <p className="text-dim">{t.noHistory}</p>
      ) : (
        <div className="admin-list">
          {transactions.map((tx) => (
            <div key={tx.id} className="admin-list-item">
              <div>
                <div>
                  <strong>{typeLabel(tx.type)}</strong>
                </div>
                {tx.description && (
                  <div className="text-dim" style={{ fontSize: '1rem' }}>{tx.description}</div>
                )}
                <div className="text-dim" style={{ fontSize: '1rem' }}>
                  {new Date(tx.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </div>
              </div>
              <span
                className="admin-badge"
                style={{ color: tx.points > 0 ? 'var(--accent)' : undefined }}
              >
                {tx.points > 0 ? '+' : ''}{tx.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    PURCHASE: 'Compra',
    BONUS: 'Bonus',
    REWARD_REDEMPTION: 'Canje',
    REFUND: 'Reembolso',
    EXPIRATION: 'Expiración',
    ADMIN_ADJUSTMENT: 'Ajuste admin',
  }
  return labels[type] ?? type
}
