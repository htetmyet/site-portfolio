import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types';
import { fetchPosts } from '../services/apiClient';

const BlogListPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPosts();
        if (isMounted) {
          setPosts(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load posts');
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
          <p className="text-sm uppercase tracking-[0.3em] text-brand-primary">Insights</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-text-dark">Explore our latest blogs</h1>
          <p className="text-brand-text-muted md:text-lg">
            Deep dives, practical guides, and perspectives on building intelligent products.
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
          <p className="text-brand-text-muted">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-brand-text-muted">No posts published yet. Check back soon!</p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.id} className="rounded-xl border border-brand-border bg-brand-surface shadow-sm overflow-hidden">
                <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                  <img
                    src={post.imageUrl || 'https://picsum.photos/800/600?random=200'}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="flex flex-col gap-4 p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-brand-accent">
                      <span className="font-semibold">{post.category || 'General'}</span>
                      {post.publishedAt && <span className="text-brand-text-muted">• {new Date(post.publishedAt).toLocaleDateString()}</span>}
                    </div>
                    <h2 className="text-2xl font-bold text-brand-text-dark">{post.title}</h2>
                    <p className="text-brand-text-muted">{post.excerpt}</p>
                    <div className="mt-auto flex flex-wrap gap-2">
                      {post.tags.map((tag, idx) => (
                        <span key={`${post.id}-tag-${idx}`} className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={`/blog/${post.id}`}
                      className="mt-4 inline-flex items-center text-sm font-semibold text-brand-primary hover:text-brand-primary/80"
                    >
                      Continue reading →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogListPage;
