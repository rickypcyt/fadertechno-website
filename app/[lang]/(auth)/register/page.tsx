import Link from 'next/link'
import RegisterForm from '@/app/components/auth/RegisterForm'
import { getDictionary, hasLocale } from '@/lib/i18n/dictionaries'
import { notFound } from 'next/navigation'

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ redirect?: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const { redirect } = await searchParams
  const loginHref = redirect
    ? `/${lang}/login?redirect=${encodeURIComponent(redirect)}`
    : `/${lang}/login`

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link href={`/${lang}`} className="auth-close" aria-label={dict.auth.back}>×</Link>
        <h1>{dict.auth.register.title}</h1>
        <RegisterForm redirect={redirect} dict={dict} />
        <p className="auth-switch">
          {dict.auth.register.switch}{' '}
          <Link href={loginHref}>{dict.auth.register.switchLink}</Link>
        </p>
      </div>
    </section>
  )
}
