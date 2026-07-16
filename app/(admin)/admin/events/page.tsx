import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import EventForm from '@/app/components/admin/EventForm'

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
      <div className="admin-page-header">
        <div>
          <h1>Eventos</h1>
          <p className="text-dim">{events.length} eventos · {events.filter((e: typeof events[0]) => e.published).length} publicados</p>
        </div>
        <EventForm />
      </div>

      <div className="admin-list" style={{ marginTop: '24px' }}>
        {events.length === 0 ? (
          <p className="text-dim">No hay eventos creados. Crea el primero con el botón de arriba.</p>
        ) : (
          events.map((event: typeof events[0]) => {
            const sold = event.ticketTypes.reduce(
              (sum: number, tt: typeof event.ticketTypes[0]) => sum + tt.tickets.length,
              0
            )
            const totalStock = event.ticketTypes.reduce(
              (sum: number, tt: typeof event.ticketTypes[0]) => sum + tt.stock,
              0
            )
            return (
              <div key={event.id} className="admin-list-item">
                <div>
                  <div><strong>{event.title}</strong></div>
                  <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                    {new Date(event.startDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} · {event.venue.name}
                  </div>
                  <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                    {sold} / {totalStock} vendidas · {event.ticketTypes.length} tipos
                  </div>
                </div>
                <span className={`admin-badge${event.published ? '' : ' muted'}`}>
                  {event.published ? 'Activo' : 'Borrador'}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
