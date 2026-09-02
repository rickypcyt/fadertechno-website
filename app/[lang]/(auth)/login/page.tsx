import Link from 'next/link'
import { X } from 'lucide-react'
import LoginForm from '@/app/components/auth/LoginForm'
import { getDictionary, hasLocale } from '@/lib/i18n/dictionaries'
import { notFound } from 'next/navigation'

export default async function LoginPage({
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
  const registerHref = redirect
    ? `/${lang}/register?redirect=${encodeURIComponent(redirect)}`
    : `/${lang}/register`

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link href={`/${lang}`} className="auth-close" aria-label={dict.auth.back}>
          <X size={18} strokeWidth={2.5} />
        </Link>
        <h1>{dict.auth.login.title}</h1>
        <LoginForm redirect={redirect} dict={dict} />
        <p className="auth-switch">
          {dict.auth.login.switch}{' '}
          <Link href={registerHref}>{dict.auth.login.switchLink}</Link>
        </p>
      </div>
    </section>
  )
}
