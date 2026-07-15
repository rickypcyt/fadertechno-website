import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export default async function AdminRewardsPage() {
  await requireRole('ADMIN')

  const rewards = await prisma.reward.findMany({
    orderBy: { cost: 'asc' },
  })

  return (
    <div className="admin-page">
      <h1>Recompensas</h1>
      <div className="admin-list">
        {rewards.length === 0 ? (
          <p className="text-dim">No hay recompensas creadas.</p>
        ) : (
          rewards.map((r: typeof rewards[0]) => (
            <div key={r.id} className="admin-list-item">
              <div>
                <div><strong>{r.name}</strong></div>
                {r.description && (
                  <div className="text-dim" style={{ fontSize: '0.85rem' }}>{r.description}</div>
                )}
                <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                  Coste: {r.cost} créditos · Stock: {r.stock ?? '∞'}
                </div>
              </div>
              <span className={`admin-badge${r.active ? '' : ' muted'}`}>
                {r.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
