import React from 'react';

export default function UserDashboardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-page dash-page">
      {children}
    </div>
  );
}
