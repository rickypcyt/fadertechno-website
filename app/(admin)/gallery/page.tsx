import { requireRole } from '@/lib/permissions'

export default async function AdminGalleryPage() {
  await requireRole('ADMIN')

  return (
    <div className="admin-page">
      <h1>Galería</h1>
      <p className="text-dim">Gestión de imágenes de sesiones y archivo.</p>
    </div>
  )
}
