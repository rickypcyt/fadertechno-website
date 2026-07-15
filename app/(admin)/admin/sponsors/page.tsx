import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export default async function AdminSponsorsPage() {
  await requireRole('ADMIN')

  const sponsors = await prisma.sponsor.findMany({
    include: { events: { include: { event: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="admin-page">
      <h1>Patrocinadores</h1>
      <div className="admin-list">
        {sponsors.length === 0 ? (
          <p className="text-dim">No hay patrocinadores creados.</p>
        ) : (
          sponsors.map((s: typeof sponsors[0]) => (
            <div key={s.id} className="admin-list-item">
              <div>
                <div><strong>{s.name}</strong></div>
                <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                  {s.events.length} eventos patrocinados
                </div>
                {s.website && (
                  <div className="text-dim" style={{ fontSize: '0.8rem' }}>{s.website}</div>
                )}
              </div>
              <span className="admin-badge">{s.events.length} eventos</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
