import Link from 'next/link'
import RegisterForm from '@/app/components/auth/RegisterForm'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams
  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-back">← Volver</Link>
        <h1>Crear cuenta</h1>
        <RegisterForm redirect={redirect} />
        <p className="auth-switch">
          ¿Ya tienes cuenta?{' '}
          <Link href={loginHref}>Inicia sesión</Link>
        </p>
      </div>
    </section>
  )
}
