import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { fetchProducts } from '../../services/apiClient';

const AdminProductsListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchProducts();
        if (isMounted) {
          setProducts(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load products');
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
          <h2 className="text-xl font-semibold text-brand-text-dark">Products</h2>
          <p className="text-sm text-brand-text-muted">Manage your product catalog and detail pages.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90"
        >
          + New Product
        </Link>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <p className="text-brand-text-muted">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-brand-text-muted">No products yet. Add your first product to showcase it on the landing page.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-border text-left text-sm">
            <thead className="bg-brand-bg-light">
              <tr className="text-brand-text-muted">
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Display Order</th>
                <th className="px-4 py-3 font-semibold">Features</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-brand-bg-light">
                  <td className="px-4 py-3 text-brand-text-dark">
                    <div className="font-semibold">{product.title}</div>
                    <div className="text-xs text-brand-text-muted">{product.description.slice(0, 80)}{product.description.length > 80 ? '…' : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-brand-text-muted">{product.displayOrder ?? '—'}</td>
                  <td className="px-4 py-3 text-brand-text-muted">{product.features.slice(0, 3).join(', ')}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/products/${product.id}`}
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

export default AdminProductsListPage;
