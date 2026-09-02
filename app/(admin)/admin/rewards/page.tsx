import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'

export default async function AdminRewardsPage() {
  await requireRole('ADMIN')
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.rewards

  const rewards = await prisma.reward.findMany({
    orderBy: { cost: 'asc' },
  })

  return (
    <div className="admin-page">
      <h1>{t.title}</h1>
      <div className="admin-list">
        {rewards.length === 0 ? (
          <p className="text-dim">{t.empty}</p>
        ) : (
          rewards.map((r: typeof rewards[0]) => (
            <div key={r.id} className="admin-list-item">
              <div>
                <div><strong>{r.name}</strong></div>
                {r.description && (
                  <div className="text-dim" style={{ fontSize: '1rem' }}>{r.description}</div>
                )}
                <div className="text-dim" style={{ fontSize: '1rem' }}>
                  {t.costStock
                    .replace('{cost}', String(r.cost))
                    .replace('{stock}', String(r.stock ?? '∞'))}
                </div>
              </div>
              <span className={`admin-badge${r.active ? '' : ' muted'}`}>
                {r.active ? dict.panel.common.active : dict.panel.common.inactive}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
