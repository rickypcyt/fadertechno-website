import { requireRole } from '@/lib/permissions'

export default async function TicketsPage() {
  await requireRole('ADMIN')

  return (
    <div className="admin-page">
      <h1>Entradas — Session 014</h1>
      <div className="admin-list">
        <div className="admin-list-item">
          <div>
            <strong>Early Bird</strong>
            <span className="admin-badge muted">Agotado</span>
          </div>
          <span>100 / 100</span>
        </div>
        <div className="admin-list-item">
          <div>
            <strong>General</strong>
          </div>
          <span>220 / 300</span>
        </div>
        <div className="admin-list-item">
          <div>
            <strong>VIP</strong>
          </div>
          <span>25 / 50</span>
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: '24px' }}>
        + Añadir tipo de entrada
      </button>
    </div>
  )
}
