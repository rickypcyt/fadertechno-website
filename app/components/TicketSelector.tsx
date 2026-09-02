'use client'

import { useState, useEffect } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type TicketType = {
  id: string
  name: string
  price: string
  stock: number
}

type Props = {
  ticketTypes: TicketType[]
  eventId: string
  dict: Dictionary
}

export default function TicketSelector({ ticketTypes, eventId, dict }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resuming, setResuming] = useState(false)

  const total = ticketTypes.reduce((sum, tt) => {
    const qty = quantities[tt.id] ?? 0
    return sum + qty * Number(tt.price)
  }, 0)

  const totalItems = Object.values(quantities).reduce((s, q) => s + q, 0)

  const handleQtyChange = (ttId: string, delta: number, stock: number) => {
    setError(null)
    setQuantities((prev) => {
      const current = prev[ttId] ?? 0
      const next = Math.max(0, Math.min(current + delta, stock, 10))
      return { ...prev, [ttId]: next }
    })
  }

  const doCheckout = async (items: { ticketTypeId: string; quantity: number }[]) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const data = await res.json()

      if (res.status === 401) {
        localStorage.setItem(
          'pendingCheckout',
          JSON.stringify({ items, eventId, pathname: window.location.pathname })
        )
        window.location.href =
          '/login?redirect=' + encodeURIComponent(window.location.pathname)
        return
      }

      if (!res.ok) {
        setError(data.error ?? dict.ticket.errorPurchase)
        return
      }

      if (data.url) {
        localStorage.removeItem('pendingCheckout')
        window.location.href = data.url
      }
    } catch {
      setError(dict.ticket.errorConnection)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (totalItems === 0) return

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }))

    await doCheckout(items)
  }

  useEffect(() => {
    const pending = localStorage.getItem('pendingCheckout')
    if (!pending) return

    try {
      const { items, eventId: pendingEventId } = JSON.parse(pending)
      if (pendingEventId !== eventId) return

      setResuming(true)

      const restoredQty: Record<string, number> = {}
      for (const item of items) {
        restoredQty[item.ticketTypeId] = item.quantity
      }
      setQuantities(restoredQty)

      localStorage.removeItem('pendingCheckout')

      setTimeout(() => {
        doCheckout(items)
        setResuming(false)
      }, 500)
    } catch {
      localStorage.removeItem('pendingCheckout')
    }
  }, [eventId])

  return (
    <div>
      {resuming && (
        <p style={{ color: 'var(--accent)', marginBottom: '16px', fontSize: '1rem' }}>
          {dict.ticket.resuming}
        </p>
      )}
      <div className="admin-list">
        {ticketTypes.map((tt, index) => {
          const qty = quantities[tt.id] ?? 0
          const soldOut = tt.stock <= 0
          const previousSoldOut = ticketTypes
            .slice(0, index)
            .every((prev) => prev.stock <= 0)
          const locked = !soldOut && !previousSoldOut

          return (
            <div
              key={tt.id}
              className="admin-list-item"
              style={{ opacity: soldOut || locked ? 0.4 : 1 }}
            >
              <div>
                <div>
                  <strong>{tt.name}</strong>
                  {soldOut && (
                    <span className="admin-badge muted" style={{ marginLeft: '8px' }}>
                      {dict.ticket.soldOut}
                    </span>
                  )}
                  {locked && !soldOut && (
                    <span className="admin-badge muted" style={{ marginLeft: '8px' }}>
                      {dict.ticket.comingSoon}
                    </span>
                  )}
                </div>
                <div className="text-dim" style={{ fontSize: '1rem' }}>
                  {Number(tt.price).toFixed(2)}€ · {dict.ticket.stock}: {tt.stock}
                </div>
              </div>
              <div className="admin-actions">
                {soldOut ? (
                  <span className="admin-badge muted">{dict.ticket.soldOut}</span>
                ) : locked ? (
                  <span className="text-dim" style={{ fontSize: '1rem' }}>{dict.ticket.locked}</span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', userSelect: 'none', WebkitUserSelect: 'none' }}>
                    <button
                      type="button"
                      className="qty-btn"
                      onPointerDown={(e) => { e.preventDefault(); handleQtyChange(tt.id, -1, tt.stock) }}
                      disabled={qty === 0}
                      aria-label="−"
                    >
                      −
                    </button>
                    <span style={{ minWidth: '20px', textAlign: 'center', userSelect: 'none' }}>
                      {qty}
                    </span>
                    <button
                      type="button"
                      className="qty-btn"
                      onPointerDown={(e) => { e.preventDefault(); handleQtyChange(tt.id, 1, tt.stock) }}
                      disabled={qty >= tt.stock || qty >= 10}
                      aria-label="+"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <p style={{ color: 'var(--accent)', marginTop: '16px', fontSize: '1rem' }}>
          {error}
        </p>
      )}

      <div
        style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <strong>{dict.ticket.total}: {total.toFixed(2)}€</strong>
          {totalItems > 0 && (
            <span className="text-dim" style={{ fontSize: '1rem', marginLeft: '8px' }}>
              ({totalItems} {totalItems === 1 ? dict.ticket.ticketSingle : dict.ticket.ticketPlural})
            </span>
          )}
        </div>
        <button
          type="button"
          className="nav-cta"
          onClick={handleCheckout}
          disabled={totalItems === 0 || loading}
          style={{ opacity: totalItems === 0 || loading ? 0.5 : 1 }}
        >
          {loading ? dict.ticket.processing : dict.ticket.buy}
        </button>
      </div>
    </div>
  )
}
