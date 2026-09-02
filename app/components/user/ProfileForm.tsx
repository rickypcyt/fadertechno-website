'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/update-profile'
import type { Dictionary } from '@/lib/i18n/dictionaries'

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
  }
  dict: Dictionary
}

export default function ProfileForm({ user, dict }: ProfileFormProps) {
  const t = dict.panel.profile
  const [name, setName] = useState(user.name)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    const result = await updateProfile(name)
    if (result?.error) {
      setError(result.error)
    } else {
      setSaved(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-field">
        <label>{t.name}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePlaceholder}
        />
      </div>

      <div className="form-field">
        <label>{t.email}</label>
        <input type="email" value={user.email} disabled />
      </div>

      <div className="form-field">
        <label>{t.role}</label>
        <input type="text" value={user.role} disabled />
      </div>

      <div className="form-field">
        <label>{t.memberSince}</label>
        <input
          type="text"
          value={new Date(user.createdAt).toLocaleDateString('es-ES')}
          disabled
        />
      </div>

      {error && <p className="auth-error">{error}</p>}
      {saved && <p style={{ color: 'var(--accent)' }}>{t.saved}</p>}

      <button type="submit" className="nav-cta">
        {t.saveChanges}
      </button>
    </form>
  )
}
