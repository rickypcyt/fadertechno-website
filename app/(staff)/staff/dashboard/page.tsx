export default function StaffDashboard() {
  return (
    <div className="admin-page">
      <h1>Staff</h1>
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-label">Escanear QR</div>
          <div className="admin-card-value">Abrir escáner</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Dentro</div>
          <div className="admin-card-value">0 personas</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Validaciones</div>
          <div className="admin-card-value">0 tickets</div>
        </div>
      </div>
    </div>
  )
}
