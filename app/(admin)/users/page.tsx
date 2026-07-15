import { requireRole } from '@/lib/permissions'

export default async function UsersPage() {
  await requireRole('ADMIN')

  return (
    <div className="admin-page">
      <h1>Usuarios</h1>
      <div className="admin-list">
        <div className="admin-list-item">
          <div>
            <strong>Richard</strong>
            <span className="admin-badge">CORE</span>
          </div>
          <div className="admin-actions">
            <span>12 eventos · 1240 Credits</span>
            <button className="btn btn-ghost">Editar</button>
            <button className="btn btn-ghost">Suspender</button>
          </div>
        </div>
      </div>
    </div>
  )
}
