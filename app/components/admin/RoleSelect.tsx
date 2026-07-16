'use client'

import { useState } from 'react'

const roles = ['USER', 'STAFF', 'PROMOTER', 'ADMIN', 'SUPER_ADMIN'] as const

type User = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
}

export default function RoleSelect({
  user,
  currentUserId,
}: {
  user: User
  currentUserId: string
}) {
  const [role, setRole] = useState(user.role)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = async (newRole: string) => {
    if (newRole === role) return
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error')
        return
      }

      setRole(newRole)
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const isSelf = user.id === currentUserId

  return (
    <div className="role-select-wrap">
      <select
        className="role-select"
        value={role}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving || isSelf}
        data-role={role}
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {isSelf && (
        <span className="role-self-badge">Tú</span>
      )}
      {error && <span className="role-error">{error}</span>}
      {saving && <span className="role-saving">...</span>}
    </div>
  )
}
