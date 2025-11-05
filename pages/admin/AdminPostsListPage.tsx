import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types';
import { fetchPosts } from '../../services/apiClient';

const AdminPostsListPage: React.FC = () => {
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
    <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-sm">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-brand-text-dark">Posts</h2>
          <p className="text-sm text-brand-text-muted">Manage the articles displayed on your public blog.</p>
        </div>
        <Link
          to="/admin/posts/new"
          className="inline-flex items-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90"
        >
          + New Post
        </Link>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <p className="text-brand-text-muted">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="text-brand-text-muted">No posts yet. Create your first post to populate the blog.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-border text-left text-sm">
            <thead className="bg-brand-bg-light">
              <tr className="text-brand-text-muted">
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Published</th>
                <th className="px-4 py-3 font-semibold">Tags</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-brand-bg-light">
                  <td className="px-4 py-3 text-brand-text-dark">
                    <div className="font-semibold">{post.title}</div>
                    <div className="text-xs text-brand-text-muted">{post.excerpt.slice(0, 80)}{post.excerpt.length > 80 ? '…' : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-brand-text-muted">{post.category || 'General'}</td>
                  <td className="px-4 py-3 text-brand-text-muted">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleString() : 'Draft'}
                  </td>
                  <td className="px-4 py-3 text-brand-text-muted">{post.tags.join(', ')}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/posts/${post.id}`}
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

export default AdminPostsListPage;
