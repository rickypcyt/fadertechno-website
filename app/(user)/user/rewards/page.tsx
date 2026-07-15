import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { Role } from '@/lib/roles'

export default async function UserRewardsPage() {
  const user = await requireRole(Role.USER)

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
    <div>
      <h1>Canjear puntos</h1>
      <p className="text-dim">Gasta tus créditos en recompensas</p>

      <div className="admin-card" style={{ marginTop: '32px', marginBottom: '32px' }}>
        <div className="admin-card-label">Saldo disponible</div>
        <div className="admin-card-value">{creditBalance} créditos</div>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
        Recompensas disponibles
      </h2>
      {rewards.length === 0 ? (
        <p className="text-dim">No hay recompensas disponibles ahora mismo.</p>
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
                    <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                      {reward.description}
                    </div>
                  )}
                  <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                    Coste: {reward.cost} créditos
                    {reward.stock !== null && ` · Stock: ${reward.stock}`}
                  </div>
                </div>
                <div className="admin-actions">
                  {outOfStock ? (
                    <span className="admin-badge muted">Agotado</span>
                  ) : canAfford ? (
                    <button className="nav-cta">Canjear</button>
                  ) : (
                    <span className="admin-badge muted">
                      Faltan {reward.cost - creditBalance}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        Historial de puntos
      </h2>
      {transactions.length === 0 ? (
        <p className="text-dim">Sin movimientos todavía.</p>
      ) : (
        <div className="admin-list">
          {transactions.map((tx: typeof transactions[0]) => (
            <div key={tx.id} className="admin-list-item">
              <div>
                <div>
                  <strong>{tx.type}</strong>
                </div>
                {tx.description && (
                  <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                    {tx.description}
                  </div>
                )}
                <div className="text-dim" style={{ fontSize: '0.8rem' }}>
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
