import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createAdminUser, deleteAdminUser, fetchAdminUser, updateAdminUser } from '../../services/apiClient';

const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [userDraft, setUserDraft] = useState({ email: '', name: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isNew) {
      setUserDraft({ email: '', name: '', password: '', confirmPassword: '' });
      setLoading(false);
      return;
    }

    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setStatus(null);
      try {
        const match = await fetchAdminUser(Number(id));
        if (isMounted) {
          setUserDraft({ email: match.email, name: match.name, password: '', confirmPassword: '' });
        }
      } catch (error: any) {
        if (isMounted) {
          setStatus({ type: 'error', message: error.message || 'Failed to load user' });
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
  }, [id, isNew]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (userDraft.password || userDraft.confirmPassword) {
      if (userDraft.password !== userDraft.confirmPassword) {
        setStatus({ type: 'error', message: 'Password and confirmation must match.' });
        return;
      }
    }

    setSaving(true);
    try {
      if (isNew) {
        if (!userDraft.password) {
          setStatus({ type: 'error', message: 'Password is required for new users.' });
          setSaving(false);
          return;
        }
        await createAdminUser({ email: userDraft.email, name: userDraft.name, password: userDraft.password });
        setStatus({ type: 'success', message: 'Admin user created.' });
        navigate('/admin/users', { replace: true });
      } else if (id) {
        await updateAdminUser(Number(id), {
          email: userDraft.email,
          name: userDraft.name,
          password: userDraft.password || undefined,
        });
        setStatus({ type: 'success', message: 'Admin user updated.' });
        setUserDraft((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to save user.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || isNew) return;
    const confirmed = window.confirm('Delete this admin user?');
    if (!confirmed) return;

    setSaving(true);
    setStatus(null);
    try {
      await deleteAdminUser(Number(id));
      navigate('/admin/users', { replace: true });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to delete user.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-sm">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-brand-text-dark">{isNew ? 'Create Admin User' : 'Edit Admin User'}</h2>
          <p className="text-sm text-brand-text-muted">{isNew ? 'Invite a new admin to this console.' : 'Update admin details or reset password.'}</p>
        </div>
        <Link to="/admin/users" className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80">
          ← Back to admin users
        </Link>
      </header>

      {status && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}
        >
          {status.message}
        </div>
      )}

      {loading ? (
        <p className="text-brand-text-muted">Loading user…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Name
            <input
              required
              value={userDraft.name}
              onChange={(event) => setUserDraft((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Email
            <input
              required
              type="email"
              value={userDraft.email}
              onChange={(event) => setUserDraft((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-brand-text-dark">
              {isNew ? 'Password' : 'New Password'}
              <input
                type="password"
                value={userDraft.password}
                onChange={(event) => setUserDraft((prev) => ({ ...prev, password: event.target.value }))}
                className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
                placeholder={isNew ? '' : 'Leave blank to keep current password'}
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-brand-text-dark">
              Confirm Password
              <input
                type="password"
                value={userDraft.confirmPassword}
                onChange={(event) => setUserDraft((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
                placeholder={isNew ? '' : 'Repeat new password'}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                disabled={saving}
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              className="rounded-lg bg-brand-primary px-6 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Saving…' : isNew ? 'Create Admin' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default AdminUserDetailPage;
