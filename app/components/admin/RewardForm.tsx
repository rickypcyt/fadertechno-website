'use client'

import { useState } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export type RewardData = {
  id: string
  name: string
  description: string | null
  pointsCost: number
  salePriceCents: number | null
  realCostCents: number | null
  stock: number | null
  maxPerUser: number | null
  maxPerEvent: number | null
  active: boolean
}

type Props = {
  dict: Dictionary
  reward?: RewardData
  onDone?: () => void
}

const empty = {
  name: '',
  description: '',
  pointsCost: '',
  salePriceCents: '',
  realCostCents: '',
  stock: '',
  maxPerUser: '',
  maxPerEvent: '',
  active: true,
}

export default function RewardForm({ dict, reward, onDone }: Props) {
  const t = dict.panel.rewards
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(
    reward
      ? {
          name: reward.name,
          description: reward.description ?? '',
          pointsCost: String(reward.pointsCost),
          salePriceCents: reward.salePriceCents !== null ? String(reward.salePriceCents / 100) : '',
          realCostCents: reward.realCostCents !== null ? String(reward.realCostCents / 100) : '',
          stock: reward.stock !== null ? String(reward.stock) : '',
          maxPerUser: reward.maxPerUser !== null ? String(reward.maxPerUser) : '',
          maxPerEvent: reward.maxPerEvent !== null ? String(reward.maxPerEvent) : '',
          active: reward.active,
        }
      : empty,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const set = (field: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const payload = {
      ...(reward ? { id: reward.id } : {}),
      name: form.name.trim(),
      description: form.description.trim() || null,
      pointsCost: parseInt(form.pointsCost) || 0,
      salePriceCents: form.salePriceCents ? Math.round(parseFloat(form.salePriceCents) * 100) : null,
      realCostCents: form.realCostCents ? Math.round(parseFloat(form.realCostCents) * 100) : null,
      stock: form.stock ? parseInt(form.stock) : null,
      maxPerUser: form.maxPerUser ? parseInt(form.maxPerUser) : null,
      maxPerEvent: form.maxPerEvent ? parseInt(form.maxPerEvent) : null,
      active: form.active,
    }

    if (!payload.name || payload.pointsCost <= 0) {
      setError(t.errorCreate)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/admin/rewards', {
        method: reward ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? t.errorCreate)
        setLoading(false)
        return
      }
      setSuccess(reward ? t.configSaved : t.success)
      setTimeout(() => {
        setOpen(false)
        setSuccess('')
        if (onDone) onDone()
        else window.location.reload()
      }, 900)
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
          <h2>{reward ? t.edit : t.newReward}</h2>
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
            <label>{t.nameLabel}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>{t.descriptionLabel}</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>{t.pointsCostLabel}</label>
              <input
                type="number"
                min="1"
                value={form.pointsCost}
                onChange={(e) => set('pointsCost', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>{t.stockLabel}</label>
              <input
                type="number"
                min="0"
                placeholder="∞"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>{t.salePriceLabel}</label>
              <input
                type="number"
                step="0.01"
                placeholder="3.00"
                value={form.salePriceCents}
                onChange={(e) => set('salePriceCents', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>{t.realCostLabel}</label>
              <input
                type="number"
                step="0.01"
                placeholder="1.00"
                value={form.realCostCents}
                onChange={(e) => set('realCostCents', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>{t.maxPerUserLabel}</label>
              <input
                type="number"
                min="1"
                placeholder="∞"
                value={form.maxPerUser}
                onChange={(e) => set('maxPerUser', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>{t.maxPerEventLabel}</label>
              <input
                type="number"
                min="1"
                placeholder="∞"
                value={form.maxPerEvent}
                onChange={(e) => set('maxPerEvent', e.target.value)}
              />
            </div>
          </div>

          <label className="event-form-checkbox">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set('active', e.target.checked)}
            />
            <span>{t.activeLabel}</span>
          </label>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="event-form-success">{success}</p>}

          <div className="event-form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="event-form-submit"
              disabled={loading}
            >
              {loading ? dict.panel.common.saving : reward ? t.saveSubmit : t.createSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
