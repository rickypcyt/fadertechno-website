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
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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
        {loading ? 'Creando...' : 'Crear cuenta'}
      </button>
    </form>
  )
}
