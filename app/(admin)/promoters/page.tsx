import { requireRole } from '@/lib/permissions'

export default async function AdminPromotersPage() {
  await requireRole('ADMIN')

  return (
    <div className="admin-page">
      <h1>RRPP</h1>
      <p className="text-dim">Gestión de promoters, códigos y comisiones.</p>
    </div>
  )
}
