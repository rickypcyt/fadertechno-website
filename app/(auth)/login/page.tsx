import Link from 'next/link'
import LoginForm from '@/app/components/auth/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams
  const registerHref = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-back">← Volver</Link>
        <h1>Acceder</h1>
        <LoginForm redirect={redirect} />
        <p className="auth-switch">
          ¿No tienes cuenta?{' '}
          <Link href={registerHref}>Regístrate</Link>
        </p>
      </div>
    </section>
  )
}
