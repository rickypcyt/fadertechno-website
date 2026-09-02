'use client'

import { useState } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { LoyaltyConfig } from '@/lib/loyalty'

type Props = {
  dict: Dictionary
  initialConfig: LoyaltyConfig
}

export default function LoyaltyConfigForm({ dict, initialConfig }: Props) {
  const t = dict.panel.rewards
  const [pointsPerEuro, setPointsPerEuro] = useState(String(initialConfig.pointsPerEuro))
  const [qrValidity, setQrValidity] = useState(String(initialConfig.qrValiditySeconds))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/loyalty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointsPerEuro: parseInt(pointsPerEuro),
          qrValiditySeconds: parseInt(qrValidity),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? dict.panel.common.unexpectedError)
        setLoading(false)
        return
      }
      setSuccess(t.configSaved)
      setTimeout(() => setSuccess(''), 2000)
    } catch {
      setError(dict.panel.common.connectionError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} style={{ marginTop: '16px' }}>
      <div className="form-row">
        <div className="form-field">
          <label>{t.pointsPerEuro}</label>
          <input
            type="number"
            min="1"
            value={pointsPerEuro}
            onChange={(e) => setPointsPerEuro(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label>{t.qrValidity}</label>
          <input
            type="number"
            min="10"
            value={qrValidity}
            onChange={(e) => setQrValidity(e.target.value)}
            required
          />
        </div>
      </div>
      {error && <p className="auth-error">{error}</p>}
      {success && <p className="event-form-success">{success}</p>}
      <div style={{ marginTop: '16px' }}>
        <button type="submit" className="event-form-submit" disabled={loading}>
          {loading ? dict.panel.common.saving : t.saveConfig}
        </button>
      </div>
    </form>
  )
}
