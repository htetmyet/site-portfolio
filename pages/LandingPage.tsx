import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Portfolio from '../components/Portfolio';
import Products from '../components/Products';
import Blog from '../components/Blog';
import Testimonials from '../components/Testimonials';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import ProductDetail from '../components/ProductDetail';
import type { Product, SiteContent } from '../types';
import { defaultContent } from '../content/defaultContent';
import { fetchPosts, fetchProducts, fetchProjects, fetchServices, fetchSettings } from '../services/apiClient';
import { applyDocumentBranding } from '../utils/documentBranding';

const LandingPage: React.FC = () => {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      try {
        const [settingsResp, servicesResp, projectsResp, productsResp, postsResp] = await Promise.all([
          fetchSettings(),
          fetchServices(),
          fetchProjects(),
          fetchProducts(),
          fetchPosts(),
        ]);

        if (isMounted) {
          const blogLimit = settingsResp.settings.blogPreviewLimit ?? defaultContent.settings.blogPreviewLimit ?? 3;
          const productLimit = settingsResp.settings.productPreviewLimit ?? defaultContent.settings.productPreviewLimit ?? 2;

          const resolvedSlides = settingsResp.heroSlides.length
            ? settingsResp.heroSlides
            : [
                {
                  title: settingsResp.settings.heroHeadline,
                  subtitle: settingsResp.settings.heroSubheadline || defaultContent.settings.heroSubheadline,
                  supertitle: settingsResp.settings.tagline || defaultContent.heroSlides[0].supertitle,
                  imageUrl: defaultContent.heroSlides[0].imageUrl,
                  order: 0,
                },
              ];

          const resolvedServices = servicesResp.length ? servicesResp : defaultContent.services;
          const resolvedProducts = productsResp.length ? productsResp : defaultContent.products;
          const resolvedProjects = projectsResp.length ? projectsResp : defaultContent.projects;
          const projectLimit = settingsResp.settings.projectPreviewLimit ?? defaultContent.settings.projectPreviewLimit ?? 6;
          const resolvedPosts = postsResp.length ? postsResp : defaultContent.posts;

          applyDocumentBranding({
            companyName: settingsResp.settings.companyName,
            heroHeadline: settingsResp.settings.heroHeadline,
            logoUrl: settingsResp.settings.logoUrl,
          });

          setContent({
            settings: settingsResp.settings,
            heroSlides: resolvedSlides,
            services: resolvedServices,
            projects: resolvedProjects.slice(0, Math.max(1, projectLimit)),
            products: resolvedProducts.slice(0, Math.max(1, productLimit)),
            posts: resolvedPosts.slice(0, Math.max(1, blogLimit)),
          });
          setError('');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load dynamic content. Showing defaults instead.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (href: string | null) => {
    setSelectedProduct(null);
    setTimeout(() => {
      if (href) {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-brand-bg-light min-h-screen">
      <Header companyName={content.settings.companyName} logoUrl={content.settings.logoUrl || undefined} onNavigate={handleNavigate} />
      {error && (
        <div className="bg-brand-accent/10 border border-brand-accent text-brand-text-dark text-center py-3 mt-24">
          {error}
        </div>
      )}
      <main>
        {selectedProduct ? (
          <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} />
        ) : (
          <>
            <Hero slides={content.heroSlides} />
            <Services services={content.services} />
            <Portfolio projects={content.projects} />
            <div className="bg-brand-bg-light-alt">
              <Products products={content.products} onProductSelect={handleProductSelect} viewAllHref="/products" />
            </div>
            <Blog posts={content.posts} viewAllHref="/blog" />
            <Testimonials />
          </>
        )}
        <ContactForm settings={content.settings} />
      </main>
      <Footer settings={content.settings} />
      {loading && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-surface px-4 py-2 text-sm shadow-lg text-brand-text-muted border border-brand-border">
          Loading latest content...
        </div>
      )}
    </div>
  );
};

export default LandingPage;
