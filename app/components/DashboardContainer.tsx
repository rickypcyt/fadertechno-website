// Shared container for dashboard layouts (admin & user)
import React from 'react';

export default function DashboardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-page">
      <h1>Dashboard</h1>
      <div className="admin-grid">{children}</div>
    </div>
  );
}
