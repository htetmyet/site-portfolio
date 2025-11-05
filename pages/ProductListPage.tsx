import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { fetchProducts } from '../services/apiClient';

const ProductListPage: React.FC = () => {
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
    <div className="min-h-screen bg-brand-bg-light pb-20">
      <header className="bg-brand-surface border-b border-brand-border py-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 text-center md:text-left">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-primary">Product Suite</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-text-dark">Explore our solutions</h1>
          <p className="text-brand-text-muted md:text-lg">
            Browse the complete collection of AI products engineered to accelerate your roadmap.
          </p>
          <Link
            to="/"
            className="inline-flex items-center self-center rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text-dark hover:bg-brand-bg-light md:self-start"
          >
            ← Back to landing page
          </Link>
        </div>
      </header>

      <main className="mx-auto mt-12 max-w-5xl px-6">
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <p className="text-brand-text-muted">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-brand-text-muted">No products available yet. Please check back soon.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {products.map((product, index) => (
              <article key={product.id ?? index} className="rounded-xl border border-brand-border bg-brand-surface shadow-sm overflow-hidden flex flex-col">
                <img
                  src={product.images[0] || `https://picsum.photos/800/600?random=${index + 500}`}
                  alt={product.title}
                  className="h-56 w-full object-cover"
                />
                <div className="flex flex-col gap-4 p-6">
                  <h2 className="text-2xl font-bold text-brand-text-dark">{product.title}</h2>
                  <p className="text-brand-text-muted">{product.description}</p>
                  <ul className="grid gap-2 text-sm text-brand-text-muted/90">
                    {product.features.slice(0, 4).map((feature, idx) => (
                      <li key={`${product.id}-feature-${idx}`} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/products/${product.id}`}
                    className="mt-auto inline-flex w-max items-center rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-5 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
                  >
                    View product page
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductListPage;
