import React from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Settings', to: '/admin' },
  { label: 'Posts', to: '/admin/posts' },
  { label: 'AI Content', to: '/admin/ai-content' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Account', to: '/admin/account' },
];

const AdminLayout: React.FC = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();


  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="min-h-screen bg-brand-bg-light">
      <header className="border-b border-brand-border bg-brand-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-text-dark">Admin Console</h1>
            <p className="text-sm text-brand-text-muted">
              Signed in as <span className="font-semibold">{admin.name}</span> ({admin.email})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.open('/', '_blank')}
              className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text-dark hover:bg-brand-bg-light transition-colors"
            >
              View Site
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
        <nav className="border-t border-brand-border bg-brand-surface">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text-muted hover:bg-brand-bg-light'
                    }`
                  }
                end={item.to === '/admin'}
                >
                  {item.label}
                </NavLink>
              ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
