import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Post } from '../types';
import { fetchPost } from '../services/apiClient';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPost(Number(id));
        if (isMounted) {
          setPost(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load post');
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
    <div className="min-h-screen bg-brand-bg-light pb-20">
      <header className="bg-brand-surface border-b border-brand-border py-14">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6">
          <Link to="/blog" className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80">← All posts</Link>
          {loading ? (
            <h1 className="text-3xl font-bold text-brand-text-dark">Loading article…</h1>
          ) : post ? (
            <>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-primary">{post.category || 'Article'}</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-brand-text-dark">{post.title}</h1>
              <p className="text-brand-text-muted md:text-lg">{post.excerpt}</p>
              {post.publishedAt && (
                <p className="text-sm text-brand-text-muted/80">Published {new Date(post.publishedAt).toLocaleDateString()}</p>
              )}
            </>
          ) : (
            <h1 className="text-3xl font-bold text-brand-text-dark">Post not found</h1>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6">
        {error && <div className="my-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        {loading ? (
          <p className="mt-10 text-brand-text-muted">Loading content…</p>
        ) : post ? (
          <article className="prose prose-lg max-w-none py-12 text-brand-text-dark prose-headings:text-brand-text-dark prose-a:text-brand-primary">
            <img
              src={post.imageUrl || 'https://picsum.photos/800/600?random=300'}
              alt={post.title}
              className="mb-8 w-full rounded-xl"
            />
            {post.content
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((paragraph, idx) => (
                <p key={`${post.id}-paragraph-${idx}`}>{paragraph}</p>
              ))}
          </article>
        ) : (
          <p className="mt-10 text-brand-text-muted">Nothing to display.</p>
        )}
      </main>
    </div>
  );
};

export default BlogDetailPage;
