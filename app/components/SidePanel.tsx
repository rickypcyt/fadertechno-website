// Generic side panel component used for admin and user navigation
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  // optional visibility control
  adminOnly?: boolean;
  userOnly?: boolean;
}

interface SidePanelProps {
  navItems: NavItem[];
  userRole?: string;
}

export default function SidePanel({ navItems, userRole }: SidePanelProps) {
  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') return false;
    if (item.userOnly && userRole !== 'USER') return false;
    return true;
  });

  return (
    <aside className="admin-sidebar">
      <Link href="/" className="admin-sidebar-brand">
        <div className="admin-sidebar-logo" />
        <span className="admin-sidebar-name">FADER</span>
      </Link>
      <nav className="admin-sidebar-nav">
        {visibleItems.map((item) => (
          <Link key={item.href} href={item.href} className="admin-nav-link">
            <span className="admin-nav-icon">{item.icon}</span>
            <span className="admin-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
