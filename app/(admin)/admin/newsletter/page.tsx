import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import NewsletterComposer from '@/app/components/admin/NewsletterComposer'
import WelcomeEmailComposer from '@/app/components/admin/WelcomeEmailComposer'
import { getWelcomeEmailConfig } from '@/app/actions/welcome-email'

export default async function AdminNewsletterPage() {
  const user = await requireRole('ADMIN')
  const dict = await getDictionary(defaultLocale)
  const t = dict.panel.newsletter

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const activeCount = subscribers.filter((s: typeof subscribers[0]) => s.subscribed).length

  const welcomeConfig = await getWelcomeEmailConfig()

  return (
    <div className="admin-page">
      <h1>{t.title}</h1>
      <p className="text-dim">
        {t.summary
          .replace('{active}', String(activeCount))
          .replace('{total}', String(subscribers.length))}
      </p>

      <h2 style={{ marginTop: '40px' }}>{t.welcomeEmail}</h2>
      <p className="text-dim" style={{ marginBottom: '16px' }}>
        {t.welcomeDesc}
      </p>
      <WelcomeEmailComposer
        initialConfig={welcomeConfig}
        adminEmail={user.email}
        dict={dict}
      />

      <h2 style={{ marginTop: '48px' }}>{t.compose}</h2>
      <p className="text-dim" style={{ marginBottom: '16px' }}>
        {t.composeDesc}
      </p>
      <NewsletterComposer
        subscriberCount={activeCount}
        adminEmail={user.email}
        dict={dict}
      />

      <h2 style={{ marginTop: '40px' }}>{t.subscribers}</h2>
      <div className="admin-list" style={{ marginTop: '16px' }}>
        {subscribers.length === 0 ? (
          <p className="text-dim">{t.empty}</p>
        ) : (
          subscribers.map((s: typeof subscribers[0]) => (
            <div key={s.id} className="admin-list-item">
              <div>
                <div><strong>{s.email}</strong></div>
                <div className="text-dim" style={{ fontSize: '1rem' }}>
                  {new Date(s.createdAt).toLocaleDateString('es-ES')}
                </div>
              </div>
              <span className={`admin-badge${s.subscribed ? '' : ' muted'}`}>
                {s.subscribed ? dict.panel.common.activeBadge : dict.panel.common.bajaBadge}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
