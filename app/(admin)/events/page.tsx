import { requireRole } from '@/lib/permissions'

export default async function EventsPage() {
  await requireRole('ADMIN')

  return (
    <div className="admin-page">
      <h1>Eventos</h1>
      <div className="admin-list">
        <div className="admin-list-item">
          <div>
            <strong>Session 014</strong>
            <span className="admin-badge">Publicado</span>
          </div>
          <div className="admin-actions">
            <button className="btn btn-ghost">Editar</button>
            <button className="btn btn-ghost">Duplicar</button>
            <button className="btn btn-ghost">Eliminar</button>
          </div>
        </div>
        <div className="admin-list-item">
          <div>
            <strong>Session 013</strong>
            <span className="admin-badge muted">Finalizado</span>
          </div>
          <div className="admin-actions">
            <button className="btn btn-ghost">Editar</button>
          </div>
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: '24px' }}>
        + Nuevo evento
      </button>
    </div>
  )
}
