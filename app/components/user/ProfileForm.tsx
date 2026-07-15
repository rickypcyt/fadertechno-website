'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/update-profile'

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
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
        <label>Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
        />
      </div>

      <div className="form-field">
        <label>Email</label>
        <input type="email" value={user.email} disabled />
      </div>

      <div className="form-field">
        <label>Rol</label>
        <input type="text" value={user.role} disabled />
      </div>

      <div className="form-field">
        <label>Miembro desde</label>
        <input
          type="text"
          value={new Date(user.createdAt).toLocaleDateString('es-ES')}
          disabled
        />
      </div>

      {error && <p className="auth-error">{error}</p>}
      {saved && <p style={{ color: 'var(--accent)' }}>Guardado correctamente.</p>}

      <button type="submit" className="nav-cta">
        Guardar cambios
      </button>
    </form>
  )
}
