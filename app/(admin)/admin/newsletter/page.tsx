import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'
import NewsletterComposer from '@/app/components/admin/NewsletterComposer'
import WelcomeEmailComposer from '@/app/components/admin/WelcomeEmailComposer'
import { getWelcomeEmailConfig } from '@/app/actions/welcome-email'

export default async function AdminNewsletterPage() {
  const user = await requireRole('ADMIN')

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const activeCount = subscribers.filter((s: typeof subscribers[0]) => s.subscribed).length

  const welcomeConfig = await getWelcomeEmailConfig()

  return (
    <div className="admin-page">
      <h1>Newsletter</h1>
      <p className="text-dim">{activeCount} suscriptores activos · {subscribers.length} totales</p>

      <h2 style={{ marginTop: '40px' }}>Email de bienvenida</h2>
      <p className="text-dim" style={{ marginBottom: '16px' }}>
        Configura el email que recibe quien se suscribe.
      </p>
      <WelcomeEmailComposer
        initialConfig={welcomeConfig}
        adminEmail={user.email}
      />

      <h2 style={{ marginTop: '48px' }}>Componer newsletter</h2>
      <p className="text-dim" style={{ marginBottom: '16px' }}>
        Envía un email a todos los suscriptores activos.
      </p>
      <NewsletterComposer
        subscriberCount={activeCount}
        adminEmail={user.email}
      />

      <h2 style={{ marginTop: '40px' }}>Suscriptores</h2>
      <div className="admin-list" style={{ marginTop: '16px' }}>
        {subscribers.length === 0 ? (
          <p className="text-dim">No hay suscriptores.</p>
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
                {s.subscribed ? 'Activo' : 'Baja'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
