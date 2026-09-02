'use client'

import { useState } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type ErrorOrder = {
  id: string
  status: string
  fulfillmentStatus: string
  fulfillmentError: string | null
  totalCents: number
  createdAt: string
  user: { name: string | null; email: string }
  event: { title: string }
}

type StuckOrder = {
  id: string
  status: string
  totalCents: number
  createdAt: string
  user: { name: string | null; email: string }
  event: { title: string }
}

type Props = {
  dict: Dictionary
  errorOrders: ErrorOrder[]
  stuckOrders: StuckOrder[]
  failedWebhooks: number
}

export default function IncidentsClient({ dict, errorOrders, stuckOrders, failedWebhooks }: Props) {
  const [retrying, setRetrying] = useState<string | null>(null)
  const [reconciling, setReconciling] = useState(false)
  const [message, setMessage] = useState('')

  const handleRetry = async (orderId: string) => {
    setRetrying(orderId)
    setMessage('')
    try {
      const res = await fetch('/api/admin/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry', orderId }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`Orden ${orderId.slice(-6)} fulfillment completado.`)
        setTimeout(() => window.location.reload(), 1200)
      } else {
        setMessage(`Error: ${data.error ?? 'No se pudo reintentar.'}`)
      }
    } catch {
      setMessage(dict.panel.common.connectionError)
    } finally {
      setRetrying(null)
    }
  }

  const handleReconcile = async () => {
    setReconciling(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reconcile' }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`Reconciliación: ${data.checked} revisadas, ${data.fulfilled} completadas, ${data.failed} fallidas.`)
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setMessage(`Error: ${data.error ?? 'Reconciliación fallida.'}`)
      }
    } catch {
      setMessage(dict.panel.common.connectionError)
    } finally {
      setReconciling(false)
    }
  }

  const hasIssues = errorOrders.length > 0 || stuckOrders.length > 0 || failedWebhooks > 0

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Incidencias</h1>
          <p className="text-dim">
            Pedidos con errores de fulfillment, estados atascados y webhooks fallidos.
          </p>
        </div>
        <button
          type="button"
          className="admin-create-btn"
          onClick={handleReconcile}
          disabled={reconciling}
        >
          {reconciling ? 'Reconciliando…' : 'Reconciliar con Stripe'}
        </button>
      </div>

      {message && (
        <p style={{ marginTop: '16px', color: 'var(--accent)', fontSize: '1rem' }}>{message}</p>
      )}

      {!hasIssues && (
        <div className="admin-card" style={{ marginTop: '24px' }}>
          <p className="text-dim">No hay incidencias. Todo en orden.</p>
        </div>
      )}

      {/* Summary */}
      {(errorOrders.length > 0 || failedWebhooks > 0) && (
        <div className="admin-grid" style={{ marginTop: '24px' }}>
          {errorOrders.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-label">Errores de fulfillment</div>
              <div className="admin-card-value" style={{ color: '#fbbf24' }}>{errorOrders.length}</div>
            </div>
          )}
          {stuckOrders.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-label">Pedidos atascados (&gt;15min)</div>
              <div className="admin-card-value" style={{ color: '#fbbf24' }}>{stuckOrders.length}</div>
            </div>
          )}
          {failedWebhooks > 0 && (
            <div className="admin-card">
              <div className="admin-card-label">Webhooks fallidos</div>
              <div className="admin-card-value" style={{ color: '#f87171' }}>{failedWebhooks}</div>
            </div>
          )}
        </div>
      )}

      {/* Fulfillment errors */}
      {errorOrders.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginTop: '32px', marginBottom: '16px' }}>
            Errores de fulfillment
          </h2>
          <div className="admin-list">
            {errorOrders.map((o) => (
              <div key={o.id} className="admin-list-item">
                <div>
                  <div>
                    <strong>{o.event.title}</strong>
                    <span className="admin-badge" style={{ marginLeft: '8px', color: '#fbbf24' }}>
                      {o.status}
                    </span>
                  </div>
                  <div className="text-dim" style={{ fontSize: '1rem' }}>
                    {o.user.name ?? o.user.email} · {(o.totalCents / 100).toFixed(2)} €
                  </div>
                  {o.fulfillmentError && (
                    <div className="text-dim" style={{ fontSize: '1rem', color: '#f87171' }}>
                      {o.fulfillmentError}
                    </div>
                  )}
                  <div className="text-dim" style={{ fontSize: '1rem' }}>
                    ORD-{o.id.slice(-6)} · {new Date(o.createdAt).toLocaleString('es-ES')}
                  </div>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="nav-cta"
                    disabled={retrying === o.id}
                    onClick={() => handleRetry(o.id)}
                  >
                    {retrying === o.id ? 'Reintentando…' : 'Reintentar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Stuck orders */}
      {stuckOrders.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginTop: '32px', marginBottom: '16px' }}>
            Pedidos atascados
          </h2>
          <div className="admin-list">
            {stuckOrders.map((o) => (
              <div key={o.id} className="admin-list-item">
                <div>
                  <div>
                    <strong>{o.event.title}</strong>
                    <span className="admin-badge muted" style={{ marginLeft: '8px' }}>
                      {o.status}
                    </span>
                  </div>
                  <div className="text-dim" style={{ fontSize: '1rem' }}>
                    {o.user.name ?? o.user.email} · {(o.totalCents / 100).toFixed(2)} €
                  </div>
                  <div className="text-dim" style={{ fontSize: '1rem' }}>
                    ORD-{o.id.slice(-6)} · {new Date(o.createdAt).toLocaleString('es-ES')}
                  </div>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="nav-cta"
                    disabled={retrying === o.id}
                    onClick={() => handleRetry(o.id)}
                  >
                    {retrying === o.id ? 'Reintentando…' : 'Fulfill'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
