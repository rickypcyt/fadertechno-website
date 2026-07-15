import { requireRole } from '@/lib/permissions'

export default async function AdminRewardsPage() {
  await requireRole('ADMIN')

  return (
    <div className="admin-page">
      <h1>Recompensas</h1>
      <p className="text-dim">Catálogo de recompensas canjeables con créditos.</p>
    </div>
  )
}
