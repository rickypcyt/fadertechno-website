// Shared card component for dashboard items
import React from 'react';

interface DashboardCardProps {
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
}

export default function DashboardCard({ label, value, meta }: DashboardCardProps) {
  return (
    <div className="admin-card">
      <div className="admin-card-label">{label}</div>
      <div className="admin-card-value">{value}</div>
      {meta && <div className="admin-card-meta">{meta}</div>}
    </div>
  );
}
