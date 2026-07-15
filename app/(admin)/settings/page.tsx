import { requireRole } from '@/lib/permissions'

export default async function AdminSettingsPage() {
  await requireRole('ADMIN')

  return (
    <div className="admin-page">
      <h1>Configuración</h1>
      <p className="text-dim">Ajustes generales del sitio y de la plataforma.</p>
    </div>
  )
}
