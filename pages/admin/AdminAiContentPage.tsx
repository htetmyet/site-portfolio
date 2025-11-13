import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AiModel, AiNewsItem, AiRewriteResult } from '../../types';
import { fetchAiNews, fetchAiModels, rewriteAiPost } from '../../services/apiClient';

const toneSuggestions = ['data scientist', 'world leader', 'technical evangelist', 'product marketer', 'comedy writer', 'policy analyst'];

const AdminAiContentPage: React.FC = () => {
  const [articles, setArticles] = useState<AiNewsItem[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedError, setFeedError] = useState('');
  const [rewriting, setRewriting] = useState(false);
  const [rewriteError, setRewriteError] = useState('');
  const [rewriteResult, setRewriteResult] = useState<AiRewriteResult | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [models, setModels] = useState<AiModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState('');
  const [keywords, setKeywords] = useState('AI');
  const [tone, setTone] = useState('data scientist');

  const selectedArticle = articles.find((item) => item.id === selectedArticleId) || null;

  const loadFeed = async () => {
    setLoadingFeed(true);
    setFeedError('');
    setRewriteResult(null);
    setRewriteError('');
    try {
      const data = await fetchAiNews(keywords);
      setArticles(data);
      setSelectedArticleId(data[0]?.id ?? null);
    } catch (error: any) {
      setFeedError(error.message || 'Failed to load AI headlines.');
      setArticles([]);
      setSelectedArticleId(null);
    } finally {
      setLoadingFeed(false);
    }
  };

  const loadModels = async () => {
    setModelsLoading(true);
    setModelsError('');
    try {
      const data = await fetchAiModels();
      setModels(data);
      if (!data.length) {
        setSelectedModel('');
        return;
      }
      setSelectedModel((current) => (current && data.find((model) => model.name === current) ? current : data[0].name));
    } catch (error: any) {
      setModelsError(error.message || 'Failed to load local Ollama models.');
      setModels([]);
      setSelectedModel('');
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
    loadModels();
  }, []);

  const handleRewrite = async () => {
    if (!selectedArticle) return;
    setRewriting(true);
    setRewriteError('');
    setRewriteResult(null);
    try {
      const result = await rewriteAiPost({
        title: selectedArticle.title,
        content: selectedArticle.content,
        model: selectedModel || undefined,
        tone: tone.trim() || undefined,
      });
      setRewriteResult(result);
      setCopyState('idle');
    } catch (error: any) {
      setRewriteError(error.message || 'Failed to rewrite this article.');
    } finally {
      setRewriting(false);
    }
  };

  const handleCopyMarkdown = async () => {
    if (!rewriteResult?.markdown || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(rewriteResult.markdown);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2500);
    } catch (error) {
      console.warn('[ai-content] Failed to copy markdown', error);
    }
  };

  return (
    <section className="space-y-6 rounded-xl border border-brand-border bg-brand-surface p-6 shadow-sm">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-brand-text-dark">AI Content Studio</h2>
          <p className="text-sm text-brand-text-muted">
            Pull the latest AI headlines, preview the source text, and rewrite it with your local Ollama model.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <label className="flex flex-col text-sm text-brand-text-muted md:flex-row md:items-center md:gap-3">
              <span className="font-semibold text-brand-text-dark">Keywords</span>
              <input
                type="text"
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                placeholder="e.g. robotics, autonomous systems"
                className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-brand-text-dark md:mt-0"
              />
            </label>
            <label className="flex flex-col text-sm text-brand-text-muted md:flex-row md:items-center md:gap-3">
              <span className="font-semibold text-brand-text-dark">Writer tone</span>
              <input
                type="text"
                list="tone-suggestions"
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                placeholder="e.g. comedy writer"
                className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-brand-text-dark md:mt-0"
              />
              <datalist id="tone-suggestions">
                {toneSuggestions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadFeed}
              disabled={loadingFeed}
              className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text-dark transition-colors hover:bg-brand-bg-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingFeed ? 'Refreshing…' : 'Refresh Feed'}
            </button>
            <button
              type="button"
              onClick={loadModels}
              disabled={modelsLoading}
              className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text-dark transition-colors hover:bg-brand-bg-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {modelsLoading ? 'Loading Models…' : 'Refresh Models'}
            </button>
          </div>
        </div>
      </header>

      <div className="rounded-lg border border-brand-border bg-brand-bg-light/60 px-4 py-3 text-sm text-brand-text-muted">
        Make sure <span className="font-semibold">Ollama</span> is running locally (default `http://localhost:11434`) and that the{' '}
        <code className="rounded bg-black/5 px-1 py-0.5 text-xs">OLLAMA_MODEL</code> you configured is already pulled.
      </div>

      {(feedError || modelsError) && (
        <div className="space-y-2">
          {feedError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{feedError}</div>
          )}
          {modelsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{modelsError}</div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-text-muted">Live Headlines</h3>
          {loadingFeed ? (
            <p className="text-sm text-brand-text-muted">Fetching AI news…</p>
          ) : articles.length === 0 ? (
            <p className="text-sm text-brand-text-muted">No articles available yet. Try refreshing the feed.</p>
          ) : (
            <ul className="space-y-3">
              {articles.map((article) => {
                const isActive = selectedArticleId === article.id;
                return (
                  <li key={article.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedArticleId(article.id);
                        setRewriteResult(null);
                        setRewriteError('');
                      }}
                      className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-brand-primary bg-brand-primary/5 text-brand-text-dark'
                          : 'border-brand-border bg-white text-brand-text-muted hover:bg-brand-bg-light'
                      }`}
                    >
                      <p className="text-sm font-semibold text-brand-text-dark">{article.title}</p>
                      <p className="text-xs text-brand-text-muted">
                        {article.source}
                        {article.publishedAt ? ` · ${new Date(article.publishedAt).toLocaleDateString()}` : ''}
                      </p>
                      <p className="mt-2 text-sm text-brand-text-muted">{article.snippet}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          {selectedArticle ? (
            <div className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-brand-border pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-text-muted">{selectedArticle.source}</p>
                  <h3 className="text-lg font-semibold text-brand-text-dark">{selectedArticle.title}</h3>
                  {selectedArticle.publishedAt && (
                    <p className="text-xs text-brand-text-muted">
                      {new Date(selectedArticle.publishedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                {selectedArticle.url && (
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-brand-border px-3 py-2 text-xs font-semibold text-brand-text-dark hover:bg-brand-bg-light"
                  >
                    Open Source
                  </a>
                )}
              </div>
              <div className="mt-4 rounded-lg border border-brand-border bg-brand-bg-light/80 p-4 text-sm text-brand-text-dark">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-text-muted">Source content</p>
                <div className="max-h-72 overflow-y-auto whitespace-pre-line">{selectedArticle.content}</div>
              </div>
              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <label className="flex flex-col text-sm text-brand-text-muted lg:flex-row lg:items-center lg:gap-3">
                  <span className="font-semibold text-brand-text-dark">Local model</span>
                  <select
                    value={selectedModel}
                    onChange={(event) => setSelectedModel(event.target.value)}
                    disabled={modelsLoading || models.length === 0}
                    className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-brand-text-dark lg:mt-0"
                  >
                    {models.length === 0 ? (
                      <option value="">No models detected</option>
                    ) : (
                      models.map((model) => (
                        <option key={model.name} value={model.name}>
                          {model.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleRewrite}
                  disabled={rewriting}
                  className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:bg-brand-primary/60"
                >
                  {rewriting ? 'Rewriting with LLM…' : 'Rewrite & Summarize'}
                </button>
              </div>
              {rewriteError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{rewriteError}</div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-brand-border bg-white p-5 text-sm text-brand-text-muted">
              Select an article on the left to inspect its content.
            </div>
          )}

          {rewriteResult && (
            <div className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
              <header className="flex flex-col gap-2 border-b border-brand-border pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-text-muted">LLM Draft</p>
                  <h3 className="text-lg font-semibold text-brand-text-dark">{rewriteResult.title}</h3>
                  <p className="text-sm text-brand-text-muted">{rewriteResult.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="rounded-md border border-brand-border px-3 py-2 text-xs font-semibold text-brand-text-dark hover:bg-brand-bg-light"
                >
                  {copyState === 'copied' ? 'Markdown Copied' : 'Copy Markdown'}
                </button>
              </header>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-text-muted">Markdown Output</p>
                  <textarea
                    readOnly
                    value={rewriteResult.markdown}
                    className="mt-2 h-64 w-full rounded-lg border border-brand-border bg-brand-bg-light/60 p-3 text-sm font-mono text-brand-text-dark"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-text-muted">Preview</p>
                  <div className="prose prose-sm mt-2 max-w-none overflow-y-auto rounded-lg border border-brand-border bg-brand-bg-light/40 p-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{rewriteResult.markdown}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminAiContentPage;
