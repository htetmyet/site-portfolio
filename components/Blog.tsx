import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types';

const tagColors = [
  'bg-brand-primary/10 text-brand-primary',
  'bg-brand-accent/10 text-brand-accent',
  'bg-brand-accent-teal/10 text-brand-accent-teal',
  'bg-brand-accent-orange/10 text-brand-accent-orange',
];

interface BlogProps {
  posts: Post[];
  viewAllHref?: string;
}

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const Blog: React.FC<BlogProps> = ({ posts, viewAllHref = '/blog' }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(posts.map((post) => post.category || 'General')))];

  const filteredPosts = posts.filter(
    (post) => activeCategory === 'All' || (post.category || 'General') === activeCategory
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-5');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.blog-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredPosts]);

  return (
    <section id="blog" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.25),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_60%)]" />
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-accent shadow-sm backdrop-blur">
              Insights
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-brand-text-dark">Latest insights from our lab</h2>
            <p className="mt-2 max-w-3xl text-brand-text-muted">
              Stay ahead of the curve with commentary on AI strategy, responsible innovation, and the systems powering tomorrow.
            </p>
          </div>
          <Link
            to={viewAllHref}
            className="inline-flex items-center gap-2 rounded-full border border-brand-border/80 bg-white/70 px-5 py-2 text-sm font-semibold text-brand-text-dark shadow-sm backdrop-blur hover:border-brand-accent/70 hover:text-brand-accent"
          >
            View all posts
          </Link>
        </div>

        <div className="flex justify-center flex-wrap gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-300 ${
                activeCategory === category
                  ? 'bg-brand-primary text-white shadow'
                  : 'bg-brand-surface text-brand-text-dark hover:bg-brand-primary/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="mt-10 flex gap-8 overflow-x-auto pb-6 snap-x snap-mandatory">
          {filteredPosts.length === 0 ? (
            <p className="text-brand-text-muted">No posts to display yet.</p>
          ) : (
            filteredPosts.map((post) => (
              <Link
                to={`/blog/${post.id}`}
                key={`${post.id ?? post.title}-${activeCategory}`}
                className="blog-card group relative min-w-[18rem] max-w-sm snap-start overflow-hidden rounded-2xl border border-brand-border/60 bg-white/70 shadow-lg transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-2xl backdrop-blur"
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-accent/15 via-transparent to-brand-accent-orange/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.imageUrl || 'https://picsum.photos/800/600?random=90'}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-105"
                  />
                  <span className="absolute top-4 right-4 rounded-full bg-brand-accent-teal/90 px-3 py-1 text-xs font-bold text-white">
                    {post.category || 'General'}
                  </span>
                </div>
                <div className="flex flex-col gap-4 p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary/80">
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-brand-text-dark group-hover:text-brand-primary">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm text-brand-text-muted">{post.excerpt}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {post.tags.map((tag, tagIndex) => (
                      <span key={`${tag}-${tagIndex}`} className={`${tagColors[tagIndex % tagColors.length]} rounded-full px-3 py-1 font-semibold`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="mt-auto inline-flex items-center text-sm font-semibold text-brand-primary/90">
                    Read story →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Blog;
