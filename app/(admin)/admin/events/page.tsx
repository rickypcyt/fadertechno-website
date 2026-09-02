import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import EventForm from '@/app/components/admin/EventForm'
import EventPublishToggle from '@/app/components/admin/EventPublishToggle'

export default async function AdminEventsPage() {
  await requireRole('ADMIN')
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.events

  const events = await prisma.event.findMany({
    include: {
      venue: true,
      ticketTypes: { include: { tickets: true } },
    },
    orderBy: { startDate: 'desc' },
  })

  const publishedCount = events.filter((e: typeof events[0]) => e.published).length

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t.title}</h1>
          <p className="text-dim">
            {t.countPublished
              .replace('{count}', String(events.length))
              .replace('{published}', String(publishedCount))}
          </p>
        </div>
        <EventForm dict={dict} />
      </div>

      <div className="event-cards" style={{ marginTop: '24px' }}>
        {events.length === 0 ? (
          <p className="text-dim">{t.empty}</p>
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
            const fillPct = totalStock > 0 ? Math.min(100, Math.round((sold / totalStock) * 100)) : 0
            const isPast = new Date(event.startDate) < new Date()
            return (
              <div key={event.id} className={`event-card${event.published ? '' : ' is-draft'}${isPast ? ' is-past' : ''}`}>
                <div className="event-card-header">
                  <div className="event-card-title">
                    <strong>{event.title}</strong>
                    {isPast && <span className="event-card-tag">{t.past}</span>}
                  </div>
                  <EventPublishToggle eventId={event.id} published={event.published} dict={dict} />
                </div>
                <div className="event-card-meta">
                  <span>
                    {new Date(event.startDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="event-card-dot">·</span>
                  <span>{event.venue.name}</span>
                </div>
                <div className="event-card-stats">
                  <div className="event-card-stat">
                    <span className="event-card-stat-label">{t.sold}</span>
                    <span className="event-card-stat-value">{sold} / {totalStock}</span>
                  </div>
                  <div className="event-card-stat">
                    <span className="event-card-stat-label">{t.types}</span>
                    <span className="event-card-stat-value">{event.ticketTypes.length}</span>
                  </div>
                  <div className="event-card-stat">
                    <span className="event-card-stat-label">{t.occupancy}</span>
                    <span className="event-card-stat-value">{fillPct}%</span>
                  </div>
                </div>
                <div className="event-card-bar-track">
                  <div className="event-card-bar-fill" style={{ width: `${fillPct}%` }} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
