import { requireRole } from '@/lib/permissions'

export default async function AdminNewsletterPage() {
  await requireRole('ADMIN')

  return (
    <div className="admin-page">
      <h1>Newsletter</h1>
      <p className="text-dim">Suscriptores y envíos de campañas.</p>
    </div>
  )
}
