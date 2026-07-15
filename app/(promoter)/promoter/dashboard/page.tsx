export default function PromoterDashboard() {
  return (
    <div className="admin-page">
      <h1>Promoter</h1>
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-label">Ventas</div>
          <div className="admin-card-value">0</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Código</div>
          <div className="admin-card-value">—</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Comisión</div>
          <div className="admin-card-value">0 €</div>
        </div>
      </div>
    </div>
  )
}
