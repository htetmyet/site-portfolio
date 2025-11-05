import React, { useEffect, useState } from 'react';
import type { SiteSettings } from '../../types';

interface GeneralSettingsFormProps {
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => Promise<SiteSettings>;
  saving: boolean;
}

const createInitialState = (settings: SiteSettings) => ({
  ...settings,
  blogPreviewLimit: settings.blogPreviewLimit ?? 3,
  productPreviewLimit: settings.productPreviewLimit ?? 2,
});

const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({ settings, onSave, saving }) => {
  const [localSettings, setLocalSettings] = useState(() => createInitialState(settings));
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl ?? null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    const nextState = createInitialState(settings);
    setLocalSettings(nextState);
    setLogoPreview(settings.logoUrl ?? null);
  }, [settings]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setLocalSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numericValue = value === '' ? null : Number(value);
    setLocalSettings((prev) => ({
      ...prev,
      [name]: Number.isFinite(numericValue) ? numericValue : null,
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result;
      if (typeof result === 'string') {
        setLogoPreview(result);
        setLocalSettings((prev) => ({ ...prev, logoUrl: result }));
      }
      setLogoUploading(false);
    };
    reader.onerror = () => {
      setStatus({ type: 'error', message: 'Failed to read logo file.' });
      setLogoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    setLogoPreview(null);
    setLocalSettings((prev) => ({ ...prev, logoUrl: null }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    try {
      const payload: SiteSettings = {
        ...localSettings,
        blogPreviewLimit: localSettings.blogPreviewLimit ?? 3,
        productPreviewLimit: localSettings.productPreviewLimit ?? 2,
        logoUrl: logoPreview ?? null,
      };
      const updated = await onSave(payload);
      setLocalSettings(createInitialState(updated));
      setLogoPreview(updated.logoUrl ?? null);
      setStatus({ type: 'success', message: 'Settings saved successfully.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to save settings.' });
    }
  };

  return (
    <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-sm">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-brand-text-dark">General Information</h2>
        <p className="text-sm text-brand-text-muted">
          Update company identity, contact details, and landing page preview settings.
        </p>
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Company Name
            <input
              required
              name="companyName"
              value={localSettings.companyName}
              onChange={handleInputChange}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Tagline
            <input
              name="tagline"
              value={localSettings.tagline ?? ''}
              onChange={handleInputChange}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Contact Email
            <input
              required
              type="email"
              name="contactEmail"
              value={localSettings.contactEmail}
              onChange={handleInputChange}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Contact Phone
            <input
              name="contactPhone"
              value={localSettings.contactPhone ?? ''}
              onChange={handleInputChange}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Landing Blog Preview Count
            <input
              type="number"
              min={1}
              name="blogPreviewLimit"
              value={localSettings.blogPreviewLimit ?? ''}
              onChange={handleNumberChange}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Landing Product Preview Count
            <input
              type="number"
              min={1}
              name="productPreviewLimit"
              value={localSettings.productPreviewLimit ?? ''}
              onChange={handleNumberChange}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
        </div>

        <label className="flex flex-col text-sm font-medium text-brand-text-dark">
          Contact Address
          <textarea
            name="contactAddress"
            value={localSettings.contactAddress ?? ''}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none resize-none"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Hero Headline
            <input
              required
              name="heroHeadline"
              value={localSettings.heroHeadline}
              onChange={handleInputChange}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Hero Subheadline
            <textarea
              name="heroSubheadline"
              value={localSettings.heroSubheadline ?? ''}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none resize-none"
            />
          </label>
        </div>

        <div>
          <p className="text-sm font-medium text-brand-text-dark mb-2">Brand Logo</p>
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-brand-border bg-brand-bg-light-alt p-4">
            {logoPreview ? (
              <div className="flex items-center gap-4">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-16 w-auto max-w-[180px] object-contain border border-brand-border bg-white p-2 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleLogoRemove}
                  className="rounded-lg border border-brand-border px-3 py-1 text-sm font-semibold text-brand-text-muted hover:bg-brand-bg-light"
                >
                  Remove Logo
                </button>
              </div>
            ) : (
              <p className="text-sm text-brand-text-muted">No logo uploaded yet.</p>
            )}
            <label className="ml-auto inline-flex cursor-pointer items-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90">
              {logoUploading ? 'Uploading…' : 'Upload Logo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
            </label>
          </div>
          <p className="mt-2 text-xs text-brand-text-muted">Recommended: transparent PNG or SVG, minimum 120×120px.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-brand-primary px-6 py-2 font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-60"
            disabled={saving || logoUploading}
          >
            {saving ? 'Saving…' : 'Save General Settings'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default GeneralSettingsForm;
