'use client'

import { useState } from 'react'

type Venue = {
  id: string
  name: string
}

type TicketTypeInput = {
  name: string
  price: string
  stock: string
}

export default function EventForm({ venues }: { venues: Venue[] }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [venueId, setVenueId] = useState('')
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
    setVenueId('')
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
      setError('Añade al menos un tipo de entrada con nombre y precio')
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
          venueId,
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
        setError(data.error ?? 'Error al crear evento')
        setLoading(false)
        return
      }

      setSuccess('Evento creado correctamente')
      reset()
      setTimeout(() => {
        setOpen(false)
        setSuccess('')
        window.location.reload()
      }, 1500)
    } catch {
      setError('Error de conexión')
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
        + Crear evento
      </button>
    )
  }

  return (
    <div className="event-form-overlay" onClick={() => setOpen(false)}>
      <div className="event-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-form-header">
          <h2>Nuevo evento</h2>
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
            <label>Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: FADER Night Vol. 5"
              required
            />
          </div>

          <div className="form-field">
            <label>Descripción *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el evento..."
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Fecha de inicio *</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Fecha de fin</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Sala *</label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                required
              >
                <option value="">Selecciona una sala</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>URL del cartel</label>
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
              <label>Tipos de entrada</label>
              <button
                type="button"
                className="event-form-add-btn"
                onClick={addTicketType}
              >
                + Añadir
              </button>
            </div>

            {ticketTypes.map((tt, idx) => (
              <div key={idx} className="ticket-type-row">
                <input
                  type="text"
                  placeholder="Nombre (Ej: Early Bird)"
                  value={tt.name}
                  onChange={(e) => updateTicketType(idx, 'name', e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Precio €"
                  value={tt.price}
                  onChange={(e) => updateTicketType(idx, 'price', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Stock"
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
            <span>Publicar evento (visible para los usuarios)</span>
          </label>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="event-form-success">{success}</p>}

          <div className="event-form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="event-form-submit"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
