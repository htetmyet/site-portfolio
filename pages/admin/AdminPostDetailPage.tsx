import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MarkdownEditor from '../../components/MarkdownEditor';
import type { Post } from '../../types';
import { createPost, deletePost, fetchPost, updatePost } from '../../services/apiClient';

const emptyPost: Post = {
  title: '',
  excerpt: '',
  content: '',
  category: '',
  tags: [],
  imageUrl: '',
  publishedAt: null,
};

const parseTags = (value: string) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

const AdminPostDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [postDraft, setPostDraft] = useState<Post>(emptyPost);
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isNew) {
      setPostDraft(emptyPost);
      setTagsInput('');
      setLoading(false);
      return;
    }

    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setStatus(null);
      try {
        const data = await fetchPost(Number(id));
        if (isMounted) {
          setPostDraft({ ...emptyPost, ...data });
          setTagsInput((data.tags ?? []).join(', '));
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus({ type: 'error', message: err.message || 'Failed to load post' });
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
  }, [id, isNew]);

  const handleChange = (field: keyof Post, value: string | string[] | null) => {
    setPostDraft((prev) => ({ ...prev, [field]: value as any }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    const normalizedTags = parseTags(tagsInput);

    const payload: Post = {
      ...postDraft,
      tags: normalizedTags,
      publishedAt: postDraft.publishedAt || null,
    };

    try {
      if (isNew) {
        const created = await createPost(payload);
        setStatus({ type: 'success', message: `Post "${created.title}" created.` });
        navigate(`/admin/posts/${created.id}`, { replace: true });
      } else if (id) {
        const updated = await updatePost(Number(id), payload);
        setPostDraft({ ...emptyPost, ...updated });
        setTagsInput((updated.tags ?? []).join(', '));
        setStatus({ type: 'success', message: `Post "${updated.title}" updated.` });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to save post' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || isNew) return;
    const confirmed = window.confirm('Delete this post?');
    if (!confirmed) return;

    setSaving(true);
    setStatus(null);
    try {
      await deletePost(Number(id));
      navigate('/admin/posts', { replace: true });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to delete post' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-sm">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-brand-text-dark">{isNew ? 'Create Post' : 'Edit Post'}</h2>
          <p className="text-sm text-brand-text-muted">
            {isNew ? 'Draft a new blog entry for your site.' : 'Update post content and publish details.'}
          </p>
        </div>
        <Link to="/admin/posts" className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80">
          ← Back to posts
        </Link>
      </header>

      {status && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}
        >
          {status.message}
        </div>
      )}

      {loading ? (
        <p className="text-brand-text-muted">Loading post…</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-brand-text-dark">
              Title
              <input
                required
                value={postDraft.title}
                onChange={(event) => handleChange('title', event.target.value)}
                className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-brand-text-dark">
              Category
              <input
                value={postDraft.category ?? ''}
                onChange={(event) => handleChange('category', event.target.value)}
                className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Excerpt
            <textarea
              required
              value={postDraft.excerpt}
              onChange={(event) => handleChange('excerpt', event.target.value)}
              rows={3}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>

          <MarkdownEditor
            label="Content"
            required
            value={postDraft.content}
            onChange={(value) => handleChange('content', value)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-brand-text-dark">
              Tags (comma separated)
              <input
                value={tagsInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setTagsInput(value);
                  setPostDraft((prev) => ({ ...prev, tags: parseTags(value) }));
                }}
                className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-brand-text-dark">
              Featured Image URL
              <input
                value={postDraft.imageUrl ?? ''}
                onChange={(event) => handleChange('imageUrl', event.target.value)}
                className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col text-sm font-medium text-brand-text-dark">
            Publish Date
            <input
              type="datetime-local"
              value={postDraft.publishedAt ? postDraft.publishedAt.slice(0, 16) : ''}
              onChange={(event) => handleChange('publishedAt', event.target.value ? new Date(event.target.value).toISOString() : null)}
              className="mt-1 rounded-lg border border-brand-border bg-brand-bg-light px-3 py-2 focus:border-brand-primary focus:outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                disabled={saving}
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              className="rounded-lg bg-brand-primary px-6 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Saving…' : isNew ? 'Create Post' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default AdminPostDetailPage;
