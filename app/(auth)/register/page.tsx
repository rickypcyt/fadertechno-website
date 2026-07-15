import Link from 'next/link'
import RegisterForm from '@/app/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-back">← Volver</Link>
        <h1>Crear cuenta</h1>
        <RegisterForm />
        <p className="auth-switch">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </section>
  )
}
