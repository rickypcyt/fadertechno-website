import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import TicketSelector from './TicketSelector'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      ticketTypes: { orderBy: { price: 'asc' } },
      artists: { include: { artist: true } },
      coverImage: true,
    },
  })

  if (!event || !event.published) {
    notFound()
  }

  const userTickets = user
    ? await prisma.ticket.findMany({
        where: {
          order: { userId: user.id },
          ticketType: { eventId: event.id },
        },
      })
    : []

  const hasTicket = userTickets.length > 0

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <a href="/user/events" className="text-dim" style={{ fontSize: '0.85rem' }}>
          ← Volver a eventos
        </a>
      </div>

      {event.coverImage && (
        <img
          src={event.coverImage.url}
          alt={event.title}
          style={{
            width: '100%',
            maxHeight: '300px',
            objectFit: 'cover',
            marginBottom: '24px',
          }}
        />
      )}

      <h1>{event.title}</h1>
      <p className="text-dim">
        {new Date(event.startDate).toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
        {' · '}
        {event.venue.name}
      </p>

      {event.artists.length > 0 && (
        <p className="text-dim" style={{ marginTop: '8px' }}>
          {event.artists.map((a: typeof event.artists[0]) => a.artist.name).join(', ')}
        </p>
      )}

      {event.description && (
        <p style={{ marginTop: '24px', lineHeight: 1.7 }}>{event.description}</p>
      )}

      {hasTicket && (
        <div className="admin-card" style={{ marginTop: '32px' }}>
          <div className="admin-card-label">Ya tienes entrada</div>
          <div className="admin-card-value">
            {userTickets.length} {userTickets.length === 1 ? 'entrada' : 'entradas'}
          </div>
          <a href="/user/tickets" className="admin-card-link">
            Ver mis entradas →
          </a>
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        Entradas
      </h2>

      <TicketSelector
        ticketTypes={event.ticketTypes.map((tt: typeof event.ticketTypes[0]) => ({
          id: tt.id,
          name: tt.name,
          price: tt.price.toString(),
          stock: tt.stock,
        }))}
        eventId={event.id}
      />
    </div>
  )
}
