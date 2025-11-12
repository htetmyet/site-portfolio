import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, useParams } from 'react-router-dom';
import type { Post } from '../types';
import { fetchPost } from '../services/apiClient';

const joinClasses = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(' ');

const markdownComponents: Components = {
  h1: ({ node, className, ...props }) => (
    <h1
      {...props}
      className={joinClasses(
        'mt-14 text-4xl md:text-5xl font-extrabold text-brand-text-dark tracking-tight leading-tight first:mt-0',
        className
      )}
    />
  ),
  h2: ({ node, className, ...props }) => (
    <h2
      {...props}
      className={joinClasses('mt-12 text-3xl font-bold text-brand-text-dark leading-snug', className)}
    />
  ),
  h3: ({ node, className, ...props }) => (
    <h3
      {...props}
      className={joinClasses('mt-10 text-2xl font-semibold text-brand-text-dark leading-snug', className)}
    />
  ),
  h4: ({ node, className, ...props }) => (
    <h4
      {...props}
      className={joinClasses('mt-8 text-xl font-semibold text-brand-text-dark tracking-tight', className)}
    />
  ),
  p: ({ node, className, ...props }) => (
    <p
      {...props}
      className={joinClasses('text-lg leading-relaxed text-brand-text-muted', className)}
    />
  ),
  a: ({ node, className, ...props }) => (
    <a
      {...props}
      className={joinClasses(
        'font-semibold text-brand-primary underline decoration-2 underline-offset-4 hover:text-brand-primary/80',
        className
      )}
    />
  ),
  blockquote: ({ node, className, ...props }) => (
    <blockquote
      {...props}
      className={joinClasses(
        'my-8 rounded-2xl border-l-4 border-brand-primary/60 bg-brand-primary/5 px-6 py-4 text-lg italic text-brand-text-dark',
        className
      )}
    />
  ),
  ul: ({ node, className, ...props }) => (
    <ul
      {...props}
      className={joinClasses('my-6 list-disc space-y-2 pl-6 text-brand-text-dark', className)}
    />
  ),
  ol: ({ node, className, ...props }) => (
    <ol
      {...props}
      className={joinClasses('my-6 list-decimal space-y-2 pl-6 text-brand-text-dark', className)}
    />
  ),
  li: ({ node, className, ...props }) => (
    <li
      {...props}
      className={joinClasses('leading-relaxed', className)}
    />
  ),
  hr: ({ node, className, ...props }) => (
    <hr
      {...props}
      className={joinClasses('my-12 border-t border-dashed border-brand-border', className)}
    />
  ),
  img: ({ node, className, ...props }) => (
    <img
      {...props}
      className={joinClasses('my-10 w-full rounded-2xl shadow-sm', className)}
    />
  ),
  table: ({ node, className, ...props }) => (
    <div className="my-8 overflow-hidden rounded-2xl border border-brand-border">
      <table
        {...props}
        className={joinClasses('w-full border-collapse text-left text-sm text-brand-text-dark', className)}
      />
    </div>
  ),
  thead: ({ node, className, ...props }) => (
    <thead
      {...props}
      className={joinClasses('bg-brand-bg-light text-brand-text-dark', className)}
    />
  ),
  th: ({ node, className, ...props }) => (
    <th
      {...props}
      className={joinClasses('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-text-dark', className)}
    />
  ),
  td: ({ node, className, ...props }) => (
    <td
      {...props}
      className={joinClasses('border-t border-brand-border px-4 py-3 text-brand-text-muted', className)}
    />
  ),
  code: ({ inline, className, children, node, ...props }) => {
    if (inline) {
      return (
        <code
          className={joinClasses('rounded-md bg-brand-bg-light px-2 py-1 text-sm text-brand-text-dark', className)}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre className="my-8 overflow-x-auto rounded-2xl bg-brand-bg-light p-5 text-sm leading-relaxed">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
};

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
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {post.content || ''}
            </ReactMarkdown>
          </article>
        ) : (
          <p className="mt-10 text-brand-text-muted">Nothing to display.</p>
        )}
      </main>
    </div>
  );
};

export default BlogDetailPage;
