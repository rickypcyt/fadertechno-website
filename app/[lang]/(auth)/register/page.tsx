import Link from 'next/link'
import { X } from 'lucide-react'
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
  const b = dict.auth.benefits
  const { redirect } = await searchParams
  const loginHref = redirect
    ? `/${lang}/login?redirect=${encodeURIComponent(redirect)}`
    : `/${lang}/login`

  const benefitKeys = ['points', 'priority', 'tickets', 'rewards'] as const

  return (
    <section className="auth-page auth-page--split">
      <div className="auth-split">
        <aside className="auth-benefits auth-benefits--panel">
          <h2 className="auth-benefits-title">{b.title}</h2>
          {b.subtitle && <p className="auth-benefits-subtitle">{b.subtitle}</p>}
          <ul className="auth-benefits-list">
            {benefitKeys.map((key) => (
              <li key={key} className="auth-benefit-item">
                <span className="auth-benefit-dot" />
                <div className="auth-benefit-body">
                  <p className="auth-benefit-name">{b.items[key].title}</p>
                  <p className="auth-benefit-desc">{b.items[key].desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <div className="auth-card">
          <Link href={`/${lang}`} className="auth-close" aria-label={dict.auth.back}>
            <X size={18} strokeWidth={2.5} />
          </Link>

          <h1>{dict.auth.register.title}</h1>
          <RegisterForm redirect={redirect} dict={dict} />
          <p className="auth-switch">
            {dict.auth.register.switch}{' '}
            <Link href={loginHref}>{dict.auth.register.switchLink}</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
