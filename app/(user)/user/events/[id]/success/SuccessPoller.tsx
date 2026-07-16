'use client'

import { useEffect, useState } from 'react'

type Ticket = {
  id: string
  code: string
  ticketType: { name: string }
}

type Props = {
  orderId: string
  initialIsPaid: boolean
  initialTickets: Ticket[]
  eventTitle: string
  eventDate: string
  ticketCount: number
  total: string
}

export default function SuccessPoller({
  orderId,
  initialIsPaid,
  initialTickets,
  eventTitle,
  eventDate,
  ticketCount,
  total,
}: Props) {
  const [isPaid, setIsPaid] = useState(initialIsPaid)
  const [tickets, setTickets] = useState(initialTickets)

  useEffect(() => {
    if (isPaid) return

    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      if (attempts > 30) {
        clearInterval(interval)
        return
      }

      try {
        const res = await fetch(`/api/order-status?order=${orderId}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.status === 'PAID') {
          setIsPaid(true)
          setTickets(data.tickets)
          clearInterval(interval)
        }
      } catch {}
    }, 2000)

    return () => clearInterval(interval)
  }, [isPaid, orderId])

  return (
    <div>
      <h1>{isPaid ? '¡Compra confirmada!' : 'Procesando pago...'}</h1>
      <p className="text-dim">
        {isPaid
          ? `Tu orden se ha completado correctamente. Has ganado ${Math.floor(Number(total))} puntos.`
          : 'Tu pago se está procesando. Esto puede tardar unos segundos.'}
      </p>

      <div className="admin-card" style={{ marginTop: '32px' }}>
        <div className="admin-card-label">Evento</div>
        <div className="admin-card-value">{eventTitle}</div>
        <div className="text-dim" style={{ fontSize: '0.85rem', marginTop: '8px' }}>
          {eventDate}
          {' · '}
          {ticketCount} {ticketCount === 1 ? 'entrada' : 'entradas'}
        </div>
      </div>

      {isPaid && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginTop: '32px', marginBottom: '16px' }}>
            Tus entradas
          </h2>
          <div className="admin-list">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="admin-list-item">
                <div>
                  <div>
                    <strong>{ticket.ticketType.name}</strong>
                  </div>
                  <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                    Código: {ticket.code}
                  </div>
                </div>
                <span className="admin-badge">Válida</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
        <a href="/user/tickets" className="nav-cta">Ver mis entradas</a>
        <a href="/user/events" className="admin-card-link">Seguir comprando →</a>
      </div>
    </div>
  )
}
