import Link from 'next/link'
import LoginForm from '@/app/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-back">← Volver</Link>
        <h1>Acceder</h1>
        <LoginForm />
        <p className="auth-switch">
          ¿No tienes cuenta?{' '}
          <Link href="/register">Regístrate</Link>
        </p>
      </div>
    </section>
  )
}
