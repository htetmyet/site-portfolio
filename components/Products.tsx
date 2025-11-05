import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface ProductsProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  viewAllHref?: string;
}

const Products: React.FC<ProductsProps> = ({ products, onProductSelect, viewAllHref = '/products' }) => {
  return (
    <section id="products" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.15),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.2),transparent_60%)]" />
      <div className="container mx-auto px-6 text-center">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:text-left">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center rounded-full bg-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-primary shadow-sm backdrop-blur">
              Products
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-brand-text-dark">
              Our AI products
              <span className="ml-2 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary bg-clip-text text-transparent">
                engineered for impact
              </span>
            </h2>
            <p className="mt-3 max-w-3xl text-brand-text-muted">
              Discover modular platforms, intelligent agents, and decisioning engines that plug directly into your business workflows.
            </p>
          </div>
          <Link
            to={viewAllHref}
            className="inline-flex items-center gap-2 rounded-full border border-brand-border/80 bg-white/70 px-5 py-2 text-sm font-semibold text-brand-text-dark shadow-sm backdrop-blur hover:border-brand-primary/70 hover:text-brand-primary"
          >
            Browse all products
          </Link>
        </div>
        <div className="mt-12 flex gap-8 overflow-x-auto pb-6 snap-x snap-mandatory justify-start">
          {products.length === 0 ? (
            <p className="text-brand-text-muted">Products are coming soon.</p>
          ) : (
            products.map((product, index) => (
              <div
                key={product.id ?? index}
                className="group relative min-w-[20rem] max-w-sm overflow-hidden rounded-2xl border border-brand-border/60 bg-white/70 p-1 text-left shadow-lg transition-transform duration-300 hover:-translate-y-3 hover:shadow-2xl backdrop-blur"
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-primary/15 via-transparent to-brand-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div
                  onClick={() => onProductSelect(product)}
                  className="relative h-48 w-full overflow-hidden rounded-xl cursor-pointer"
                >
                  <img
                    src={product.images[0] || `https://picsum.photos/1200/800?random=${index + 20}`}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-primary shadow">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex flex-col gap-4 p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-brand-text-dark">{product.title}</h3>
                    <p className="mt-2 text-sm text-brand-text-muted">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <button
                      onClick={() => onProductSelect(product)}
                      className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-2 font-semibold text-white shadow hover:opacity-90"
                    >
                      Quick view
                    </button>
                    {product.id && (
                      <Link
                        to={`/products/${product.id}`}
                        className="inline-flex items-center text-brand-primary hover:text-brand-primary/80"
                      >
                        Visit page →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Products;
