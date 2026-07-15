'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { getRedirectUrl } from '@/app/actions/get-redirect-url'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await authClient.signIn.email({
      email,
      password,
    })

    if (res.error) {
      setError(res.error.message ?? 'Error al iniciar sesión')
      return
    }

    const redirectUrl = await getRedirectUrl()
    router.push(redirectUrl)
    router.refresh()
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
      <button type="submit" className="btn btn-primary">
        Iniciar sesión
      </button>
    </form>
  )
}
