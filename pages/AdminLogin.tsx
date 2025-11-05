import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { admin, login } = useAuth();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (admin) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(formState.email, formState.password);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg-light px-6">
      <div className="w-full max-w-md rounded-xl border border-brand-border bg-brand-surface p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-brand-text-dark mb-2">Admin Console</h1>
        <p className="text-sm text-brand-text-muted mb-6">Sign in to manage landing page content.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Email
            <input
              required
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Password
            <input
              required
              type="password"
              name="password"
              value={formState.password}
              onChange={handleChange}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-primary py-2 font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-70"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
