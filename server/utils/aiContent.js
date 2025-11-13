import { createHash } from 'crypto';

const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';
const DEFAULT_OLLAMA_MODEL = 'llama3.2:1b';

const stripTrailingSlash = (value = '') => value.replace(/\/$/, '');

const parseHostList = (value = '') =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(stripTrailingSlash);

const looksLocalhost = (value) => /^https?:\/\/(localhost|127\.|0\.0\.0\.0)/i.test(value);

const buildDockerBridgeHost = (sourceHost) => {
  const bridgeHost = process.env.OLLAMA_DOCKER_BRIDGE_HOST || 'host.docker.internal';
  try {
    const parsed = new URL(sourceHost);
    parsed.hostname = bridgeHost;
    return stripTrailingSlash(parsed.toString());
  } catch (_error) {
    return `http://${bridgeHost}:11434`;
  }
};

const buildCandidateOllamaHosts = () => {
  const candidates = [];
  const addCandidate = (host) => {
    if (host && !candidates.includes(host)) {
      candidates.push(host);
    }
  };

  const configured = stripTrailingSlash(process.env.OLLAMA_HOST || DEFAULT_OLLAMA_HOST);
  addCandidate(configured);

  parseHostList(process.env.OLLAMA_HOST_FALLBACKS || '').forEach(addCandidate);

  if (looksLocalhost(configured)) {
    addCandidate(buildDockerBridgeHost(configured));
  }

  if (!candidates.length) {
    candidates.push(stripTrailingSlash(DEFAULT_OLLAMA_HOST));
  }

  return candidates;
};

const runWithOllamaHost = async (label, handler) => {
  const hosts = buildCandidateOllamaHosts();
  const errors = [];

  for (const host of hosts) {
    try {
      return await handler(host);
    } catch (error) {
      errors.push({ host, message: error?.message || 'Unknown error' });
      console.warn(`[aiContent] ${label} failed via ${host}`, error);
    }
  }

  const detail = errors.length
    ? errors.map(({ host, message }) => `${host}: ${message}`).join('; ')
    : 'No hosts were configured.';
  throw new Error(`Unable to reach any configured Ollama host. ${detail}`);
};
const resolveTone = (value) => (value && value.trim() ? value.trim() : 'data scientist');
const sanitizeKeywords = (keywords = []) => {
  if (!Array.isArray(keywords)) return ['artificial intelligence'];
  const normalized = keywords.map((word) => word.trim()).filter(Boolean);
  return normalized.length ? normalized : ['artificial intelligence'];
};

const htmlToPlainText = (value = '') => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const truncate = (value = '', limit = 280) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.length <= limit) {
    return trimmed;
  }
  return `${trimmed.slice(0, limit - 1).trim()}…`;
};

const defaultFeedHeaders = {
  'User-Agent': 'QuantumLeapAI/1.0 (+https://github.com/quantumleapai/site-portfolio)',
  Accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
};

const fetchTextWithTimeout = async (url, { timeout = 9000, headers = {}, ...init } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { ...defaultFeedHeaders, ...headers },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    const text = await response.text();
    return text;
  } finally {
    clearTimeout(timer);
  }
};

const fetchJsonWithTimeout = async (url, options = {}) => {
  return fetchTextWithTimeout(url, { ...options }).then((text) => {
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Failed to parse JSON from ${url}: ${error.message}`);
    }
  });
};

const htmlEntityMap = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const decodeHtmlEntities = (value = '') =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&(amp|lt|gt|quot|apos);/gi, (match, entity) => htmlEntityMap[entity.toLowerCase()] || match);


const countWords = (value = '') => {
  if (!value) return 0;
  return value.trim().split(/\s+/).filter(Boolean).length;
};

const normalizeDate = (value) => {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }
  return new Date(timestamp).toISOString();
};

const MIN_ARTICLE_WORDS = 100;

const AI_SOURCES = [
  {
    key: 'techcrunch',
    name: 'TechCrunch AI',
    type: 'wp',
    baseUrl: 'https://techcrunch.com/wp-json/wp/v2/posts',
    params: { per_page: 20 },
    defaultSearch: 'artificial intelligence',
  },
  {
    key: 'venturebeat',
    name: 'VentureBeat AI',
    type: 'wp',
    baseUrl: 'https://venturebeat.com/wp-json/wp/v2/posts',
    params: { per_page: 20 },
    defaultSearch: 'artificial intelligence',
  },
  {
    key: 'marktechpost',
    name: 'MarkTechPost',
    type: 'wp',
    baseUrl: 'https://www.marktechpost.com/wp-json/wp/v2/posts',
    params: { per_page: 20 },
    defaultSearch: 'AI',
  },
  {
    key: 'analyticsvidhya',
    name: 'Analytics Vidhya',
    type: 'wp',
    baseUrl: 'https://www.analyticsvidhya.com/wp-json/wp/v2/posts',
    params: { per_page: 20 },
    defaultSearch: 'machine learning',
  },
  {
    key: 'aitrends',
    name: 'AI Trends',
    type: 'wp',
    baseUrl: 'https://www.aitrends.com/wp-json/wp/v2/posts',
    params: { per_page: 20 },
    defaultSearch: 'artificial intelligence',
  },
];

const buildArticleId = (sourceKey, link, title) =>
  createHash('sha1').update(`${sourceKey}:${link || ''}:${title || ''}`).digest('hex');

const mapWpPostToArticle = (source, post) => {
  const title = decodeHtmlEntities(post.title?.rendered || post.title || '').trim();
  if (!title) {
    return null;
  }
  const contentHtml = post.content?.rendered || post.content || post.excerpt?.rendered || '';
  const plainContent = htmlToPlainText(decodeHtmlEntities(contentHtml));
  if (countWords(plainContent) < MIN_ARTICLE_WORDS) {
    return null;
  }
  const publishedAt = normalizeDate(post.date || post.modified);
  const decodedLink = decodeHtmlEntities(post.link || '').trim() || null;
  const excerpt = htmlToPlainText(decodeHtmlEntities(post.excerpt?.rendered || plainContent));

  return {
    id: `${source.key}-${buildArticleId(source.key, decodedLink, title)}`,
    source: source.name,
    title,
    url: decodedLink,
    publishedAt,
    snippet: truncate(excerpt || plainContent, 220),
    content: plainContent,
  };
};

const fetchWpArticles = async (source, keywords) => {
  try {
    const params = new URLSearchParams(source.params || {});
    if (!params.has('per_page')) {
      params.set('per_page', '20');
    }
    const searchQuery = keywords && keywords.length ? keywords.join(' ') : source.defaultSearch || '';
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    const url = `${source.baseUrl}?${params.toString()}`;
    const data = await fetchJsonWithTimeout(url, { timeout: source.timeout || 10000 });
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((post) => mapWpPostToArticle(source, post)).filter(Boolean);
  } catch (error) {
    console.warn(`[aiContent] Failed to scrape source: ${source.name}`, error.message || error);
    return [];
  }
};

const fetchSourceArticles = (source, keywords) => {
  if (source.type === 'wp') {
    return fetchWpArticles(source, keywords);
  }
  return Promise.resolve([]);
};

const filterByKeywords = (articles, keywords) => {
  if (!keywords?.length) {
    return articles;
  }
  const normalized = keywords.map((word) => word.toLowerCase());
  const filtered = articles.filter((article) => {
    const haystack = `${article.title} ${article.snippet} ${article.source}`.toLowerCase();
    return normalized.some((keyword) => haystack.includes(keyword));
  });
  return filtered.length ? filtered : articles;
};

const rotateArticles = (articles, limit = 12) => {
  if (articles.length <= limit) {
    return articles;
  }
  const offset = Math.floor(Date.now() / 60000) % articles.length;
  const rotated = [...articles.slice(offset), ...articles.slice(0, offset)];
  return rotated.slice(0, limit);
};

export const loadAiNews = async (keywords = []) => {
  const safeKeywords = sanitizeKeywords(keywords);
  const sourceResults = await Promise.all(AI_SOURCES.map((source) => fetchSourceArticles(source, safeKeywords)));
  let combined = sourceResults.flat();

  if (!combined.length) {
    throw new Error('No AI news sources are reachable at the moment.');
  }

  let filtered = filterByKeywords(combined, safeKeywords);
  if (!filtered.length) {
    filtered = combined;
  }
  const seen = new Set();
  const deduped = [];

  filtered.forEach((article) => {
    const key = article.title.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    deduped.push(article);
  });

  const sorted = deduped.sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
  let curated = rotateArticles(sorted, 12);

  return curated;
};

const sanitizeModelResponse = (raw) => raw.replace(/```json|```/gi, '').trim();

const tryParseModelJson = (raw) => {
  if (!raw) {
    return null;
  }
  const sanitized = sanitizeModelResponse(raw);
  const start = sanitized.indexOf('{');
  const end = sanitized.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  const candidate = sanitized.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch (error) {
    console.error('[aiContent] Failed to parse model output', error, candidate);
    return null;
  }
};

const buildPrompt = (title, content, tone, maxWords = 700) => {
  const trimmedContent = content.length > 9000 ? `${content.slice(0, 9000)}…` : content;
  const persona = resolveTone(tone);
  const cappedWords = Number.isFinite(maxWords) ? Math.max(200, Math.min(2000, Math.round(maxWords))) : 700;
  return `You are writing as a ${persona}, crafting very professional thought-leadership content for an AI consultancy blog.
Rewrite and summarize the following article in a confident, data-first tone that matches the ${persona} persona with a little sense of humour.
Return ONLY valid JSON with the schema:
{
  "title": "Compelling headline no longer than 15 words",
  "summary": "2-3 sentence abstract in plain text no longer than 30-40 words",
  "markdown": "Long-form article in Markdown (use headings, sub-headings, quote blocks, bullet lists, code fences if needed)"
}

Guidelines:
- Highlight concrete metrics, research directions, or technical implications.
- Keep Markdown under ${cappedWords} words.
- Use descriptive sub-headings (##) and include at least one bulleted list.
- End with a short call-to-action paragraph.

Original title: ${title}
Source content:
"""
${trimmedContent}
"""`;
};

export const rewriteArticleWithOllama = async ({ title, content, model: modelOverride, tone, maxWords }) => {
  if (!title || !content) {
    throw new Error('Both title and content are required to rewrite the article.');
  }

  const model = modelOverride?.trim() || process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
  const desiredLimit = Number.isFinite(maxWords) ? Number(maxWords) : null;
  const safeLimit = desiredLimit ? Math.max(200, Math.min(2000, Math.round(desiredLimit))) : 700;

  const payload = await runWithOllamaHost('Ollama generate', async (ollamaHost) => {
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: buildPrompt(title, content, tone, safeLimit),
        stream: false,
        keep_alive: 0,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Ollama returned status ${response.status}`);
    }
    return response.json();
  });

  const rawResponse = payload.response || '';
  const parsed = tryParseModelJson(rawResponse);

  if (!parsed?.markdown) {
    const fallbackMarkdown = rawResponse.trim();
    if (!fallbackMarkdown) {
      throw new Error('The model response could not be parsed into Markdown content.');
    }
    return {
      title: parsed?.title?.trim() || title,
      summary: parsed?.summary?.trim() || '',
      markdown: fallbackMarkdown,
    };
  }

  return {
    title: parsed.title?.trim() || title,
    summary: parsed.summary?.trim() || '',
    markdown: parsed.markdown.trim(),
  };
};

export const fetchOllamaModels = async () => {
  try {
    const payload = await runWithOllamaHost('Ollama models', async (ollamaHost) => {
      const response = await fetch(`${ollamaHost}/api/tags`, { method: 'GET' });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Unable to load Ollama models (status ${response.status})`);
      }
      return response.json();
    });
    const models = Array.isArray(payload.models) ? payload.models : [];
    if (!models.length) {
      throw new Error('No models found. Pull a model with `ollama pull <model>`.');
    }
    return models.map((model) => ({
      name: model.name,
      size: model.size,
      digest: model.digest,
      modifiedAt: model.modified_at || null,
    }));
  } catch (error) {
    console.error('[aiContent] Failed to query Ollama models', error);
    throw new Error(error.message || 'Unable to query the local Ollama models list. Confirm Ollama is running.');
  }
};
