import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export default async function AdminPromotersPage() {
  await requireRole('ADMIN')

  const promoters = await prisma.user.findMany({
    where: { role: 'PROMOTER' },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="admin-page">
      <h1>RRPP</h1>
      <div className="admin-list">
        {promoters.length === 0 ? (
          <p className="text-dim">No hay RRPP registrados.</p>
        ) : (
          promoters.map((p: typeof promoters[0]) => (
            <div key={p.id} className="admin-list-item">
              <div>
                <div><strong>{p.name ?? 'Sin nombre'}</strong></div>
                <div className="text-dim" style={{ fontSize: '0.85rem' }}>{p.email}</div>
              </div>
              <span className="admin-badge">Activo</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
