import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export default async function AdminEventsPage() {
  await requireRole('ADMIN')

  const events = await prisma.event.findMany({
    include: {
      venue: true,
      ticketTypes: { include: { tickets: true } },
    },
    orderBy: { startDate: 'desc' },
  })

  return (
    <div className="admin-page">
      <h1>Eventos</h1>
      <div className="admin-list">
        {events.length === 0 ? (
          <p className="text-dim">No hay eventos creados.</p>
        ) : (
          events.map((event: typeof events[0]) => {
            const sold = event.ticketTypes.reduce(
              (sum: number, tt: typeof event.ticketTypes[0]) => sum + tt.tickets.length,
              0
            )
            return (
              <div key={event.id} className="admin-list-item">
                <div>
                  <div><strong>{event.title}</strong></div>
                  <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                    {new Date(event.startDate).toLocaleDateString('es-ES')} · {event.venue.name}
                  </div>
                  <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                    {sold} entradas vendidas · {event.published ? 'Publicado' : 'Borrador'}
                  </div>
                </div>
                <span className="admin-badge">{event.published ? 'Activo' : 'Borrador'}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
