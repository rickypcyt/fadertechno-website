import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import AdminTicketPreview from '@/app/components/admin/AdminTicketPreview'

export default async function AdminTicketsPage() {
  await requireRole('ADMIN')
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.tickets

  const tickets = await prisma.ticket.findMany({
    include: {
      ticketType: { include: { event: true } },
      order: { include: { user: true } },
    },
    orderBy: { order: { createdAt: 'desc' } },
  })

  const checkedIn = tickets.filter((t: typeof tickets[0]) => t.checkedIn).length

  return (
    <div className="admin-page">
      <h1>{t.title}</h1>
      <p className="text-dim">
        {t.summary
          .replace('{total}', String(tickets.length))
          .replace('{used}', String(checkedIn))
          .replace('{pending}', String(tickets.length - checkedIn))}
      </p>

      <div className="admin-grid" style={{ marginTop: '24px' }}>
        <div className="admin-card">
          <div className="admin-card-label">{t.total}</div>
          <div className="admin-card-value">{tickets.length}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">{t.attendances}</div>
          <div className="admin-card-value" style={{ color: '#4ade80' }}>{checkedIn}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">{t.notAttended}</div>
          <div className="admin-card-value" style={{ color: '#fbbf24' }}>{tickets.length - checkedIn}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        {t.listTitle}
      </h2>
      <div className="admin-list">
        {tickets.length === 0 ? (
          <p className="text-dim">{t.empty}</p>
        ) : (
          tickets.map((ticket: typeof tickets[0]) => (
            <div key={ticket.id} className="admin-list-item">
              <div className="admin-ticket-info">
                <div><strong>{ticket.ticketType.event.title}</strong></div>
                <div className="text-dim" style={{ fontSize: '1rem' }}>
                  {ticket.ticketType.name} · {ticket.order.user.name ?? ticket.order.user.email}
                </div>
                <div className="text-dim" style={{ fontSize: '1rem' }}>
                  {t.code}: {ticket.code}
                  {ticket.checkedIn && ticket.checkedInAt && (
                    <> · {new Date(ticket.checkedInAt).toLocaleString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</>
                  )}
                </div>
                <AdminTicketPreview
                  code={ticket.code}
                  eventTitle={ticket.ticketType.event.title}
                  ticketType={ticket.ticketType.name}
                  userName={ticket.order.user.name ?? ticket.order.user.email}
                  checkedIn={ticket.checkedIn}
                  dict={dict}
                />
              </div>
              <span className={`admin-badge${ticket.checkedIn ? '' : ' muted'}`}>
                {ticket.checkedIn ? t.attended : t.pendingBadge}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
