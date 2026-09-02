'use client'

import { useState } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type TicketTypeInput = {
  name: string
  price: string
  stock: string
}

export default function EventForm({ dict }: { dict: Dictionary }) {
  const t = dict.panel.events
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [venueName, setVenueName] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [published, setPublished] = useState(false)
  const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>([
    { name: '', price: '', stock: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: '', stock: '' }])
  }

  const removeTicketType = (idx: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== idx))
  }

  const updateTicketType = (idx: number, field: keyof TicketTypeInput, value: string) => {
    setTicketTypes(ticketTypes.map((tt, i) => (i === idx ? { ...tt, [field]: value } : tt)))
  }

  const reset = () => {
    setTitle('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setVenueName('')
    setCoverUrl('')
    setPublished(false)
    setTicketTypes([{ name: '', price: '', stock: '' }])
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const validTickets = ticketTypes.filter((tt) => tt.name && tt.price)
    if (validTickets.length === 0) {
      setError(t.errorNoTickets)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          startDate,
          endDate: endDate || undefined,
          venueName,
          published,
          coverUrl: coverUrl || undefined,
          ticketTypes: validTickets.map((tt) => ({
            name: tt.name,
            price: tt.price,
            stock: parseInt(tt.stock) || 0,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? t.errorCreate)
        setLoading(false)
        return
      }

      setSuccess(t.success)
      reset()
      setTimeout(() => {
        setOpen(false)
        setSuccess('')
        window.location.reload()
      }, 1500)
    } catch {
      setError(dict.panel.common.connectionError)
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="admin-create-btn"
        onClick={() => setOpen(true)}
      >
        + {t.create}
      </button>
    )
  }

  return (
    <div className="event-form-overlay" onClick={() => setOpen(false)}>
      <div className="event-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-form-header">
          <h2>{t.newEvent}</h2>
          <button
            type="button"
            className="event-form-close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form-body">
          <div className="form-field">
            <label>{t.titleLabel}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              required
            />
          </div>

          <div className="form-field">
            <label>{t.descriptionLabel}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>{t.startLabel}</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>{t.endLabel}</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>{t.venueLabel}</label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder={t.venuePlaceholder}
                required
              />
            </div>
            <div className="form-field">
              <label>{t.coverLabel}</label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="event-form-section">
            <div className="event-form-section-header">
              <label>{t.ticketTypesLabel}</label>
              <button
                type="button"
                className="event-form-add-btn"
                onClick={addTicketType}
              >
                {t.add}
              </button>
            </div>

            {ticketTypes.map((tt, idx) => (
              <div key={idx} className="ticket-type-row">
                <input
                  type="text"
                  placeholder={t.ticketNamePlaceholder}
                  value={tt.name}
                  onChange={(e) => updateTicketType(idx, 'name', e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder={t.ticketPricePlaceholder}
                  value={tt.price}
                  onChange={(e) => updateTicketType(idx, 'price', e.target.value)}
                />
                <input
                  type="number"
                  placeholder={t.ticketStockPlaceholder}
                  value={tt.stock}
                  onChange={(e) => updateTicketType(idx, 'stock', e.target.value)}
                />
                {ticketTypes.length > 1 && (
                  <button
                    type="button"
                    className="ticket-type-remove"
                    onClick={() => removeTicketType(idx)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <label className="event-form-checkbox">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <span>{t.publishLabel}</span>
          </label>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="event-form-success">{success}</p>}

          <div className="event-form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              {dict.panel.common.cancel}
            </button>
            <button
              type="submit"
              className="event-form-submit"
              disabled={loading}
            >
              {loading ? dict.panel.common.creating : t.createSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
