import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export default async function AdminNewsletterPage() {
  await requireRole('ADMIN')

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const activeCount = subscribers.filter((s: typeof subscribers[0]) => s.subscribed).length

  return (
    <div className="admin-page">
      <h1>Newsletter</h1>
      <p className="text-dim">{activeCount} suscriptores activos · {subscribers.length} totales</p>
      <div className="admin-list" style={{ marginTop: '24px' }}>
        {subscribers.length === 0 ? (
          <p className="text-dim">No hay suscriptores.</p>
        ) : (
          subscribers.map((s: typeof subscribers[0]) => (
            <div key={s.id} className="admin-list-item">
              <div>
                <div><strong>{s.email}</strong></div>
                <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                  {new Date(s.createdAt).toLocaleDateString('es-ES')}
                </div>
              </div>
              <span className={`admin-badge${s.subscribed ? '' : ' muted'}`}>
                {s.subscribed ? 'Activo' : 'Baja'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
