import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AdminUser } from '../../types';
import { fetchAdminUsers } from '../../services/apiClient';

const AdminUsersListPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAdminUsers();
        if (isMounted) {
          setUsers(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load users');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-sm">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-brand-text-dark">Admin Users</h2>
          <p className="text-sm text-brand-text-muted">Manage the administrators who can access this console.</p>
        </div>
        <Link
          to="/admin/users/new"
          className="inline-flex items-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90"
        >
          + New Admin
        </Link>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <p className="text-brand-text-muted">Loading administrators…</p>
      ) : users.length === 0 ? (
        <p className="text-brand-text-muted">No admin accounts found. Create one to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-border text-left text-sm">
            <thead className="bg-brand-bg-light">
              <tr className="text-brand-text-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-brand-bg-light">
                  <td className="px-4 py-3 text-brand-text-dark font-semibold">{user.name}</td>
                  <td className="px-4 py-3 text-brand-text-muted">{user.email}</td>
                  <td className="px-4 py-3 text-brand-text-muted">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminUsersListPage;
