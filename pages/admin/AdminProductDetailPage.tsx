import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Product } from '../../types';
import { createProduct, deleteProduct, fetchProduct, updateProduct } from '../../services/apiClient';
import RichTextEditor from '../../components/admin/RichTextEditor';

const emptyProduct: Product = {
  title: '',
  description: '',
  longDescription: '',
  features: [],
  images: [],
  displayOrder: null,
  pageContent: '',
};

const ProductDetailAdminPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [productDraft, setProductDraft] = useState<Product>(emptyProduct);
  const [featuresText, setFeaturesText] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isNew) {
      setProductDraft(emptyProduct);
      setFeaturesText('');
      setImagesText('');
      setLoading(false);
      return;
    }

    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setStatus(null);
      try {
        const data = await fetchProduct(Number(id));
        if (isMounted) {
          setProductDraft({ ...emptyProduct, ...data });
          setFeaturesText((data.features || []).join('\n'));
          setImagesText((data.images || []).join('\n'));
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus({ type: 'error', message: err.message || 'Failed to load product' });
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

  const handleFieldChange = (field: keyof Product, value: string | number | null | string[]) => {
    setProductDraft((prev) => ({ ...prev, [field]: value as any }));
  };

  const normalizeList = (text: string) =>
    text
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    const payload: Product = {
      ...productDraft,
      features: normalizeList(featuresText),
      images: normalizeList(imagesText),
      displayOrder: productDraft.displayOrder ?? null,
      pageContent: productDraft.pageContent || null,
    };

    try {
      if (isNew) {
        const created = await createProduct(payload);
        setStatus({ type: 'success', message: `Product "${created.title}" created.` });
        navigate(`/admin/products/${created.id}`, { replace: true });
      } else if (id) {
        const updated = await updateProduct(Number(id), payload);
        setProductDraft({ ...emptyProduct, ...updated });
        setFeaturesText((updated.features || []).join('\n'));
        setImagesText((updated.images || []).join('\n'));
        setStatus({ type: 'success', message: `Product "${updated.title}" updated.` });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to save product' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || isNew) return;
    const confirmed = window.confirm('Delete this product?');
    if (!confirmed) return;

    setSaving(true);
    setStatus(null);
    try {
      await deleteProduct(Number(id));
      navigate('/admin/products', { replace: true });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to delete product' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-sm">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-brand-text-dark">{isNew ? 'Create Product' : 'Edit Product'}</h2>
          <p className="text-sm text-brand-text-muted">{isNew ? 'Add a new product to your catalog.' : 'Update product information and page content.'}</p>
        </div>
        <Link to="/admin/products" className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80">
          ← Back to products
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
        <p className="text-brand-text-muted">Loading product…</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-brand-text-dark">
              Title
              <input
                required
                value={productDraft.title}
                onChange={(event) => handleFieldChange('title', event.target.value)}
                className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-brand-text-dark">
              Display Order
              <input
                type="number"
                value={productDraft.displayOrder ?? ''}
                onChange={(event) => handleFieldChange('displayOrder', event.target.value === '' ? null : Number(event.target.value))}
                className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Elevator Pitch
            <textarea
              required
              value={productDraft.description}
              onChange={(event) => handleFieldChange('description', event.target.value)}
              rows={3}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Long Description
            <textarea
              required
              value={productDraft.longDescription}
              onChange={(event) => handleFieldChange('longDescription', event.target.value)}
              rows={5}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>

          <div>
            <p className="text-sm font-medium text-brand-text-dark mb-2">Product Page Canvas</p>
            <RichTextEditor
              value={productDraft.pageContent || ''}
              onChange={(value) => handleFieldChange('pageContent', value)}
            />
            <p className="mt-2 text-xs text-brand-text-muted">
              Use headings, lists, quotes, and links to design a unique product experience.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-brand-text-dark">
              Key Features (one per line)
              <textarea
                value={featuresText}
                onChange={(event) => setFeaturesText(event.target.value)}
                rows={5}
                className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-brand-text-dark">
              Image URLs (one per line)
              <textarea
                value={imagesText}
                onChange={(event) => setImagesText(event.target.value)}
                rows={5}
                className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
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
              {saving ? 'Saving…' : isNew ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default ProductDetailAdminPage;
