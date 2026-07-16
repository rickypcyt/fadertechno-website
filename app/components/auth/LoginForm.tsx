'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function LoginForm({ redirect }: { redirect?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      })

      if (res.error) {
        setError(res.error.message ?? 'Error al iniciar sesión')
        setLoading(false)
        return
      }

      if (redirect) {
        router.push(redirect)
        router.refresh()
        return
      }

      try {
        const meRes = await fetch('/api/me')
        if (meRes.ok) {
          const me = await meRes.json()
          if (me.role === 'SUPER_ADMIN') {
            router.push('/admin/superadmin')
          } else if (me.role === 'ADMIN') {
            router.push('/admin/dashboard')
          } else if (me.role === 'STAFF') {
            router.push('/staff/dashboard')
          } else if (me.role === 'PROMOTER') {
            router.push('/promoter')
          } else {
            router.push('/user/dashboard')
          }
          router.refresh()
          return
        }
      } catch {}

      router.push('/user/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('Error inesperado. Revisa la consola.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
