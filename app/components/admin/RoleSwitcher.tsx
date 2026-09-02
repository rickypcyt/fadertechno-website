'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, RefreshCw } from 'lucide-react'
import { Role, roleHierarchy } from '@/lib/roles'

type UserInfo = {
  id: string
  email: string
  name: string | null
  role: string
}

const ROLES: { value: Role; label: string }[] = [
  { value: Role.USER, label: 'User' },
  { value: Role.STAFF, label: 'Staff' },
  { value: Role.ADMIN, label: 'Admin' },
]

function getDashboardHref(role: string): string {
  const level = roleHierarchy[role] ?? 0
  if (level >= roleHierarchy[Role.ADMIN]) return '/admin/dashboard'
  if (level >= roleHierarchy[Role.STAFF]) return '/staff/dashboard'
  return '/user/dashboard'
}

export default function RoleSwitcher() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setUser(data))
  }, [])

  // Hide in production
  if (process.env.NODE_ENV === 'production') return null
  if (!user) return null

  const switchRole = async (role: Role) => {
    setLoading(true)
    try {
      const res = await fetch('/api/debug/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        const updated = await res.json()
        setUser(updated)
        // Redirect to the dashboard matching the new role
        window.location.href = getDashboardHref(role)
      }
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <div className="role-switcher">
      <button
        className="role-switcher-toggle"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
      >
        {loading ? (
          <RefreshCw size={14} strokeWidth={2} className="spin" />
        ) : (
          <span className="role-switcher-dot" />
        )}
        <span className="role-switcher-label">{user.role}</span>
        <ChevronDown size={14} strokeWidth={2} />
      </button>

      {open && (
        <>
          <div className="role-switcher-overlay" onClick={() => setOpen(false)} />
          <div className="role-switcher-menu">
            <div className="role-switcher-header">
              Cambiar rol (debug)
            </div>
            {ROLES.map((r) => (
              <button
                key={r.value}
                className={`role-switcher-item ${r.value === user.role ? 'active' : ''}`}
                onClick={() => switchRole(r.value)}
                disabled={loading}
              >
                <span className="role-switcher-item-dot" data-role={r.value} />
                {r.label}
                {r.value === user.role && <span className="role-switcher-check">✓</span>}
              </button>
            ))}
            <div className="role-switcher-footer">
              {user.email}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
