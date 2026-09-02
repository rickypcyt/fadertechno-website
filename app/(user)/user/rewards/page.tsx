import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'

export default async function UserRewardsPage() {
  const user = await requireRole(Role.USER)
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.userRewards

  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const creditBalance = transactions.reduce((sum: number, tx: typeof transactions[0]) => sum + tx.amount, 0)

  const rewards = await prisma.reward.findMany({
    where: { active: true },
    orderBy: { cost: 'asc' },
  })

  return (
    <div className="admin-page">
      <h1 style={{ fontSize: '1.3rem' }}>{t.title}</h1>
      <p className="text-dim">{t.subtitle}</p>

      <div className="admin-card" style={{ marginTop: '32px', marginBottom: '32px' }}>
        <div className="admin-card-label">{t.balance}</div>
        <div className="admin-card-value">{creditBalance} {dict.panel.common.credits}</div>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
        {t.available}
      </h2>
      {rewards.length === 0 ? (
        <p className="text-dim">{t.empty}</p>
      ) : (
        <div className="admin-list">
          {rewards.map((reward: typeof rewards[0]) => {
            const canAfford = creditBalance >= reward.cost
            const outOfStock = reward.stock !== null && reward.stock <= 0

            return (
              <div key={reward.id} className="admin-list-item">
                <div>
                  <div>
                    <strong>{reward.name}</strong>
                  </div>
                  {reward.description && (
                    <div className="text-dim" style={{ fontSize: '1rem' }}>
                      {reward.description}
                    </div>
                  )}
                  <div className="text-dim" style={{ fontSize: '1rem' }}>
                    {reward.stock !== null
                      ? t.costStockLabel
                          .replace('{cost}', String(reward.cost))
                          .replace('{stock}', String(reward.stock))
                      : t.costLabel.replace('{cost}', String(reward.cost))}
                  </div>
                </div>
                <div className="admin-actions">
                  {outOfStock ? (
                    <span className="admin-badge muted">{t.soldOut}</span>
                  ) : canAfford ? (
                    <button className="nav-cta">{t.redeem}</button>
                  ) : (
                    <span className="admin-badge muted">
                      {t.missing.replace('{amount}', String(reward.cost - creditBalance))}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        {t.history}
      </h2>
      {transactions.length === 0 ? (
        <p className="text-dim">{t.noHistory}</p>
      ) : (
        <div className="admin-list">
          {transactions.map((tx: typeof transactions[0]) => (
            <div key={tx.id} className="admin-list-item">
              <div>
                <div>
                  <strong>{tx.type}</strong>
                </div>
                {tx.description && (
                  <div className="text-dim" style={{ fontSize: '1rem' }}>
                    {tx.description}
                  </div>
                )}
                <div className="text-dim" style={{ fontSize: '1rem' }}>
                  {new Date(tx.createdAt).toLocaleDateString('es-ES')}
                </div>
              </div>
              <span
                className="admin-badge"
                style={{
                  color: tx.amount > 0 ? 'var(--accent)' : undefined,
                }}
              >
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
