import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/" className="layout-logo">
          <span className="layout-logo-icon">▶</span>
          GameHub
        </Link>
      </header>
      <main className="layout-main">{children}</main>
    </div>
  );
}
