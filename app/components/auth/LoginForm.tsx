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

      console.log('Login response:', res)

      if (res.error) {
        console.error('Login error:', res.error)
        setError(res.error.message ?? 'Error al iniciar sesión')
        setLoading(false)
        return
      }

      if (redirect) {
        router.replace(redirect)
        router.refresh()
        return
      }

      try {
        const meRes = await fetch('/api/me', { credentials: 'include' })
        console.log('Me response status:', meRes.status)
        if (meRes.ok) {
          const me = await meRes.json()
          console.log('User role:', me.role)
          if (me.role === 'SUPER_ADMIN') {
            router.replace('/admin/superadmin')
          } else if (me.role === 'ADMIN') {
            router.replace('/admin/dashboard')
          } else if (me.role === 'STAFF') {
            router.replace('/staff/dashboard')
          } else if (me.role === 'PROMOTER') {
            router.replace('/promoter')
          } else {
            router.replace('/user/dashboard')
          }
          router.refresh()
          return
        } else {
          console.error('Me fetch failed:', meRes.status)
          setError('Error al obtener datos de usuario')
          setLoading(false)
          return
        }
      } catch (err) {
        console.error('Me fetch error:', err)
        setError('Error de conexión al servidor')
        setLoading(false)
        return
      }

      router.replace('/user/dashboard')
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
