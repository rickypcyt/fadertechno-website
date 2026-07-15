import { requireRole } from '@/lib/permissions'

export default async function AdminAnalyticsPage() {
  await requireRole('ADMIN')

  return (
    <div className="admin-page">
      <h1>Analytics</h1>
      <p className="text-dim">Estadísticas de ventas, asistencia y engagement.</p>
    </div>
  )
}
