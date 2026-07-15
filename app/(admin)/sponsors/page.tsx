import { requireRole } from '@/lib/permissions'

export default async function AdminSponsorsPage() {
  await requireRole('ADMIN')

  return (
    <div className="admin-page">
      <h1>Patrocinadores</h1>
      <p className="text-dim">Gestión de sponsors y su vinculación a eventos.</p>
    </div>
  )
}
