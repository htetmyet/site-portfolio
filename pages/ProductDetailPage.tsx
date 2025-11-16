import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductDetail from '../components/ProductDetail';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import type { Product, SiteSettings } from '../types';
import { defaultContent } from '../content/defaultContent';
import { fetchProduct, fetchSettings } from '../services/apiClient';
import { applyDocumentBranding } from '../utils/documentBranding';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(defaultContent.settings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const [productData, settingsResp] = await Promise.all([
          fetchProduct(Number(id)),
          fetchSettings(),
        ]);
        if (!isMounted) return;
        setProduct(productData);
        setSettings(settingsResp.settings);
        applyDocumentBranding({
          companyName: settingsResp.settings.companyName,
          heroHeadline: settingsResp.settings.heroHeadline,
          logoUrl: settingsResp.settings.logoUrl,
        });
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load product');
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
  }, [id]);

  return (
    <div className="min-h-screen bg-brand-bg-light">
      <header className="bg-brand-surface border-b border-brand-border py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6">
          <Link to="/products" className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80">
            ← All products
          </Link>
          {loading ? (
            <h1 className="text-4xl font-bold text-brand-text-dark">Loading product…</h1>
          ) : product ? (
            <>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-primary">Product Spotlight</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-brand-text-dark">{product.title}</h1>
              <p className="text-brand-text-muted md:text-lg">{product.description}</p>
            </>
          ) : (
            <h1 className="text-4xl font-bold text-brand-text-dark">Product not found</h1>
          )}
        </div>
      </header>

      <main>
        {error && (
          <div className="mx-auto mt-6 max-w-4xl px-6">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="mx-auto max-w-4xl px-6 py-20 text-brand-text-muted">Preparing product experience…</div>
        ) : product ? (
          <ProductDetail product={product} onBack={() => window.history.back()} useRichContent />
        ) : (
          <div className="mx-auto max-w-4xl px-6 py-20 text-brand-text-muted">We couldn't find this product.</div>
        )}

        <div className="bg-brand-bg-light">
          <ContactForm settings={settings} />
          <Footer settings={settings} />
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;
