import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import { TrendingUp, Ticket, Users, Mail, Euro, CheckCircle2, Calendar, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

type IconType = typeof TrendingUp

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: IconType
  label: string
  value: string | number
  sub?: string
  accent: string
}) {
  return (
    <div className="analytics-card">
      <div className="analytics-card-top">
        <span className="analytics-card-icon" style={{ background: accent }}>
          <Icon size={18} strokeWidth={2} />
        </span>
        <span className="analytics-card-label">{label}</span>
      </div>
      <div className="analytics-card-value">{value}</div>
      {sub && <div className="analytics-card-sub">{sub}</div>}
    </div>
  )
}

function ProgressBar({ value, max, label, right }: { value: number; max: number; label: string; right: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="analytics-bar-row">
      <div className="analytics-bar-label">
        <span>{label}</span>
        <span className="analytics-bar-right">{right}</span>
      </div>
      <div className="analytics-bar-track">
        <div className="analytics-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default async function AdminAnalyticsPage() {
  await requireRole('ADMIN')
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.analytics

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalEvents,
    upcomingEvents,
    totalTickets,
    totalUsers,
    newUsers30d,
    totalSubscribers,
    allTickets,
    paidOrders,
    recentOrders,
    events,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { published: true, startDate: { gte: now } } }),
    prisma.ticket.count(),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.newsletterSubscriber.count({ where: { subscribed: true } }),
    prisma.ticket.findMany({ include: { ticketType: { include: { event: true } } } }),
    prisma.order.findMany({
      where: { status: 'PAID' },
      include: { event: true, tickets: { include: { ticketType: true } } },
    }),
    prisma.order.findMany({
      where: { status: 'PAID', createdAt: { gte: thirtyDaysAgo } },
      include: { event: true, tickets: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.event.findMany({
      where: { published: true },
      include: {
        venue: true,
        ticketTypes: { include: { tickets: true } },
        orders: { where: { status: 'PAID' } },
      },
      orderBy: { startDate: 'desc' },
    }),
  ])

  const totalRevenue = allTickets.reduce(
    (sum: number, t: typeof allTickets[0]) => sum + Number(t.ticketType.price),
    0
  )

  const revenue30d = recentOrders.reduce(
    (sum: number, o: typeof recentOrders[0]) => sum + Number(o.total),
    0
  )

  const checkedIn = allTickets.filter((t: typeof allTickets[0]) => t.checkedIn).length
  const checkInRate = totalTickets > 0 ? Math.round((checkedIn / totalTickets) * 100) : 0

  const pendingTickets = totalTickets - checkedIn
  const avgRevenuePerEvent = totalEvents > 0 ? Math.round(totalRevenue / totalEvents) : 0
  const avgTicketsPerEvent = totalEvents > 0 ? Math.round(totalTickets / totalEvents) : 0

  // Revenue by event (top 5)
  const revenueByEvent = events
    .map((e: typeof events[0]) => {
      const ticketsSold = e.ticketTypes.reduce(
        (s: number, tt: typeof e.ticketTypes[0]) => s + tt.tickets.length,
        0
      )
      const revenue = e.ticketTypes.reduce(
        (s: number, tt: typeof e.ticketTypes[0]) => s + tt.tickets.length * Number(tt.price),
        0
      )
      const capacity = e.venue?.capacity ?? 0
      return {
        id: e.id,
        title: e.title,
        date: e.startDate,
        ticketsSold,
        revenue,
        capacity,
        fillRate: capacity > 0 ? Math.round((ticketsSold / capacity) * 100) : 0,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const maxRevenue = revenueByEvent.length > 0 ? revenueByEvent[0].revenue : 0

  // Tickets by type
  const ticketsByType = new Map<string, { count: number; revenue: number }>()
  for (const t of allTickets) {
    const name = t.ticketType.name
    const entry = ticketsByType.get(name) ?? { count: 0, revenue: 0 }
    entry.count += 1
    entry.revenue += Number(t.ticketType.price)
    ticketsByType.set(name, entry)
  }
  const ticketTypeStats = Array.from(ticketsByType.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
  const maxTicketTypeCount = ticketTypeStats.length > 0 ? ticketTypeStats[0].count : 0

  return (
    <div className="admin-page analytics-page">
      <h1>{t.title}</h1>
      <p className="text-dim">{t.subtitle}</p>

      {/* KPI cards */}
      <div className="analytics-kpi-grid">
        <StatCard
          icon={Euro}
          label={t.totalRevenue}
          value={`${totalRevenue.toLocaleString('es-ES')} €`}
          sub={`${revenue30d.toLocaleString('es-ES')} € ${t.last30d}`}
          accent="linear-gradient(135deg, #10B981 0%, #059669 100%)"
        />
        <StatCard
          icon={Ticket}
          label={t.ticketsSold}
          value={totalTickets}
          sub={`${avgTicketsPerEvent} ${t.avgPerEvent}`}
          accent="linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
        />
        <StatCard
          icon={CheckCircle2}
          label={t.checkIn}
          value={checkedIn}
          sub={`${checkInRate}% · ${pendingTickets} ${t.pending}`}
          accent="linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)"
        />
        <StatCard
          icon={Users}
          label={t.users}
          value={totalUsers}
          sub={`+${newUsers30d} ${t.new30d}`}
          accent="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
        />
        <StatCard
          icon={Calendar}
          label={t.events}
          value={totalEvents}
          sub={`${upcomingEvents} ${t.upcoming}`}
          accent="linear-gradient(135deg, #EF4444 0%, #F97316 100%)"
        />
        <StatCard
          icon={Mail}
          label={t.newsletter}
          value={totalSubscribers}
          sub={t.activeSubs}
          accent="linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)"
        />
      </div>

      {/* Revenue by event */}
      <div className="analytics-section">
        <h2 className="analytics-section-title">
          <TrendingUp size={18} strokeWidth={2} />
          {t.topByRevenue}
        </h2>
        {revenueByEvent.length === 0 ? (
          <p className="text-dim">{t.noEventsSales}</p>
        ) : (
          <div className="analytics-bars">
            {revenueByEvent.map((e) => (
              <ProgressBar
                key={e.id}
                label={e.title}
                value={e.revenue}
                max={maxRevenue}
                right={`${e.revenue.toLocaleString('es-ES')} € · ${e.ticketsSold} ${e.ticketsSold === 1 ? t.ticketSingle : t.ticketPlural} · ${e.fillRate}%`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tickets by type */}
      <div className="analytics-section">
        <h2 className="analytics-section-title">
          <Ticket size={18} strokeWidth={2} />
          {t.salesByType}
        </h2>
        {ticketTypeStats.length === 0 ? (
          <p className="text-dim">{t.noTicketsSold}</p>
        ) : (
          <div className="analytics-bars">
            {ticketTypeStats.map((tt) => (
              <ProgressBar
                key={tt.name}
                label={tt.name}
                value={tt.count}
                max={maxTicketTypeCount}
                right={`${tt.count} · ${tt.revenue.toLocaleString('es-ES')} €`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent sales */}
      <div className="analytics-section">
        <h2 className="analytics-section-title">
          <Calendar size={18} strokeWidth={2} />
          {t.recentSales}
        </h2>
        {recentOrders.length === 0 ? (
          <p className="text-dim">{t.noRecentSales}</p>
        ) : (
          <div className="admin-list">
            {recentOrders.map((order: typeof recentOrders[0]) => (
              <div key={order.id} className="admin-list-item">
                <div>
                  <div><strong>{order.event.title}</strong></div>
                  <div className="text-dim" style={{ fontSize: '1rem' }}>
                    {order.tickets.length} {order.tickets.length === 1 ? t.ticketSingle : t.ticketPlural} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <span className="admin-badge">{Number(order.total).toFixed(0)}€</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary footer */}
      <div className="analytics-summary">
        <div className="analytics-summary-item">
          <span className="analytics-summary-label">{t.avgTicket}</span>
          <span className="analytics-summary-value">
            {totalTickets > 0 ? `${(totalRevenue / totalTickets).toFixed(2)} €` : '—'}
          </span>
        </div>
        <div className="analytics-summary-item">
          <span className="analytics-summary-label">{t.avgRevenuePerEvent}</span>
          <span className="analytics-summary-value">{avgRevenuePerEvent.toLocaleString('es-ES')} €</span>
        </div>
        <div className="analytics-summary-item">
          <span className="analytics-summary-label">{t.checkInConversion}</span>
          <span className="analytics-summary-value">{checkInRate}%</span>
        </div>
        <div className="analytics-summary-item">
          <span className="analytics-summary-label">{t.paidOrders}</span>
          <span className="analytics-summary-value">{paidOrders.length}</span>
        </div>
      </div>
    </div>
  )
}
