import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateCurrentAdmin, updateCurrentAdminPassword } from '../../services/apiClient';

const AdminAccountPage: React.FC = () => {
  const { admin, refreshAdmin, setAdminMeta } = useAuth();
  const [profile, setProfile] = useState({ email: '', name: '' });
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (admin) {
      setProfile({ email: admin.email, name: admin.name });
    }
  }, [admin]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileStatus(null);
    setSavingProfile(true);
    try {
      const updated = await updateCurrentAdmin(profile);
      setProfileStatus({ type: 'success', message: 'Account updated successfully.' });
      setAdminMeta(updated);
    } catch (error: any) {
      setProfileStatus({ type: 'error', message: error.message || 'Failed to update account.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordStatus(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await updateCurrentAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordStatus({ type: 'success', message: 'Password updated.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordStatus({ type: 'error', message: error.message || 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const refresh = async () => {
    await refreshAdmin();
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-sm">
        <header className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-brand-text-dark">Account Details</h2>
              <p className="text-sm text-brand-text-muted">Update your profile information and contact details.</p>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text-dark hover:bg-brand-bg-light"
            >
              Refresh
            </button>
          </div>
        </header>

        {profileStatus && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              profileStatus.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {profileStatus.message}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Name
            <input
              required
              value={profile.name}
              onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Email
            <input
              required
              type="email"
              value={profile.email}
              onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand-primary px-6 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-60"
            disabled={savingProfile}
          >
            {savingProfile ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-sm">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-brand-text-dark">Change Password</h2>
          <p className="text-sm text-brand-text-muted">Enter your current password and choose a new one.</p>
        </header>

        {passwordStatus && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              passwordStatus.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {passwordStatus.message}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Current Password
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            New Password
            <input
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Confirm New Password
            <input
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand-primary px-6 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-60"
            disabled={savingPassword}
          >
            {savingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminAccountPage;
