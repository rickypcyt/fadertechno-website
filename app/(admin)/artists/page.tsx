import { requireRole } from '@/lib/permissions'

export default async function AdminArtistsPage() {
  await requireRole('ADMIN')

  return (
    <div className="admin-page">
      <h1>Artistas</h1>
      <p className="text-dim">Gestión de residentes y artistas invitados.</p>
    </div>
  )
}
