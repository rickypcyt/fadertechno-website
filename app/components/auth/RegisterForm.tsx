'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function RegisterForm({ redirect }: { redirect?: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const signUpRes = await authClient.signUp.email({
      name,
      email,
      password,
    })

    if (signUpRes.error) {
      setError(signUpRes.error.message ?? 'Error al crear la cuenta')
      setLoading(false)
      return
    }

    const signInRes = await authClient.signIn.email({
      email,
      password,
    })

    if (signInRes.error) {
      setError('Cuenta creada pero no se pudo iniciar sesión automáticamente. Intenta iniciar sesión.')
      setLoading(false)
      return
    }

    if (redirect) {
      router.push(redirect)
      router.refresh()
      return
    }

    router.push('/user/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-field">
        <label htmlFor="register-name" className="auth-label">Nombre</label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="auth-input"
        />
      </div>
      <div className="auth-field">
        <label htmlFor="register-email" className="auth-label">Email</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
      </div>
      <div className="auth-field">
        <label htmlFor="register-password" className="auth-label">Contraseña</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
      </div>
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear cuenta'}
      </button>
    </form>
  )
}
