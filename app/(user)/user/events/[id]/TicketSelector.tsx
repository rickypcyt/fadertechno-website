'use client'

import { useState } from 'react'

type TicketType = {
  id: string
  name: string
  price: string
  stock: number
}

type Props = {
  ticketTypes: TicketType[]
  eventId: string
}

export default function TicketSelector({ ticketTypes, eventId }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleCheckout = async () => {
    if (totalItems === 0) return

    setLoading(true)
    setError(null)

    try {
      const items = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }))

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al procesar la compra')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="admin-list">
        {ticketTypes.map((tt) => {
          const qty = quantities[tt.id] ?? 0
          const soldOut = tt.stock <= 0

          return (
            <div key={tt.id} className="admin-list-item">
              <div>
                <div>
                  <strong>{tt.name}</strong>
                </div>
                <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                  {Number(tt.price).toFixed(2)}€ · Stock: {tt.stock}
                </div>
              </div>
              <div className="admin-actions">
                {soldOut ? (
                  <span className="admin-badge muted">Agotado</span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      className="qty-btn"
                      onClick={() => handleQtyChange(tt.id, -1, tt.stock)}
                      disabled={qty === 0}
                      aria-label="Restar"
                    >
                      −
                    </button>
                    <span style={{ minWidth: '20px', textAlign: 'center' }}>
                      {qty}
                    </span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQtyChange(tt.id, 1, tt.stock)}
                      disabled={qty >= tt.stock || qty >= 10}
                      aria-label="Sumar"
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
        <p style={{ color: 'var(--accent)', marginTop: '16px', fontSize: '0.9rem' }}>
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
          <strong>Total: {total.toFixed(2)}€</strong>
          {totalItems > 0 && (
            <span className="text-dim" style={{ fontSize: '0.85rem', marginLeft: '8px' }}>
              ({totalItems} {totalItems === 1 ? 'entrada' : 'entradas'})
            </span>
          )}
        </div>
        <button
          className="nav-cta"
          onClick={handleCheckout}
          disabled={totalItems === 0 || loading}
          style={{ opacity: totalItems === 0 || loading ? 0.5 : 1 }}
        >
          {loading ? 'Procesando...' : 'Comprar'}
        </button>
      </div>
    </div>
  )
}
