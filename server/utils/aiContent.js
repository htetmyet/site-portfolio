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

const fetchJsonWithTimeout = async (url, { timeout = 8000, ...init } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timer);
  }
};

const buildHnEndpoint = (keywords) => {
  const queryValue = encodeURIComponent(sanitizeKeywords(keywords).join(' '));
  return `https://hn.algolia.com/api/v1/search_by_date?query=${queryValue}&tags=story`;
};

const fetchHackerNewsStories = async (keywords) => {
  try {
    const data = await fetchJsonWithTimeout(buildHnEndpoint(keywords));
    if (!data?.hits?.length) {
      return [];
    }
    return data.hits
      .map((hit) => {
        const title = hit.title || hit.story_title;
        if (!title) {
          return null;
        }
        const storyText = hit.story_text ? htmlToPlainText(hit.story_text) : '';
        const description = hit._highlightResult?.story_text?.value
          ? htmlToPlainText(hit._highlightResult.story_text.value)
          : storyText;

        const contextLines = [
          storyText,
          hit.url ? `Source: ${hit.url}` : '',
        ].filter(Boolean);

        return {
          id: `hn-${hit.objectID}`,
          source: 'Hacker News',
          title,
          url: hit.url || hit.story_url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          publishedAt: hit.created_at || null,
          snippet: truncate(description || storyText || hit.title, 220),
          content:
            contextLines.join('\n\n') ||
            `${title}${hit.url ? `\n\nSource: ${hit.url}` : ''}`,
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  } catch (error) {
    console.error('[aiContent] Failed to load Hacker News feed', error);
    return [];
  }
};

const buildRedditEndpoint = (keywords) => {
  const normalized = sanitizeKeywords(keywords);
  if (normalized.length) {
    const queryValue = encodeURIComponent(normalized.join(' OR '));
    return `https://www.reddit.com/r/artificial/search.json?q=${queryValue}&restrict_sr=1&sort=new&limit=15`;
  }
  return 'https://www.reddit.com/r/artificial.json?limit=10';
};

const fetchRedditPosts = async (keywords) => {
  try {
    const data = await fetchJsonWithTimeout(buildRedditEndpoint(keywords), {
      headers: {
        'User-Agent': 'site-portfolio-ai-content/1.0 (+https://github.com/owner/repo)',
      },
    });
    const posts = data?.data?.children || [];
    return posts
      .map((entry) => {
        const post = entry?.data;
        if (!post?.title) {
          return null;
        }
        const body = post.selftext ? post.selftext.trim() : '';
        const contentBody = body || (post.url || '');
        if (!contentBody) {
          return null;
        }
        return {
          id: `reddit-${post.id}`,
          source: 'r/artificial',
          title: post.title,
          url: post.url || `https://www.reddit.com${post.permalink || ''}`,
          publishedAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : null,
          snippet: truncate(body || post.title, 220),
          content: body ? body : `${post.title}\n\nLink: ${post.url}`,
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  } catch (error) {
    console.error('[aiContent] Failed to load Reddit feed', error);
    return [];
  }
};

export const loadAiNews = async (keywords = []) => {
  const safeKeywords = sanitizeKeywords(keywords);
  const [hn, reddit] = await Promise.all([fetchHackerNewsStories(safeKeywords), fetchRedditPosts(safeKeywords)]);
  const combined = [...hn, ...reddit];
  const seen = new Set();
  const deduped = [];

  combined.forEach((article) => {
    const key = article.title.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    deduped.push(article);
  });

  if (!deduped.length) {
    throw new Error('No AI news sources are reachable at the moment.');
  }

  return deduped
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 10);
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

const buildPrompt = (title, content, tone) => {
  const trimmedContent = content.length > 9000 ? `${content.slice(0, 9000)}…` : content;
  const persona = resolveTone(tone);
  return `You are writing as a ${persona}, crafting thought-leadership content for an AI consultancy blog.
Rewrite and summarize the following article in a confident, data-first tone that matches the ${persona} persona.
Return ONLY valid JSON with the schema:
{
  "title": "Compelling headline no longer than 16 words",
  "summary": "2-3 sentence abstract in plain text",
  "markdown": "Long-form article in Markdown (use headings, bullet lists, code fences if needed)"
}

Guidelines:
- Highlight concrete metrics, research directions, or technical implications.
- Keep Markdown under 700 words.
- Use descriptive sub-headings (##) and include at least one bulleted list.
- End with a short call-to-action paragraph.

Original title: ${title}
Source content:
"""
${trimmedContent}
"""`;
};

export const rewriteArticleWithOllama = async ({ title, content, model: modelOverride, tone }) => {
  if (!title || !content) {
    throw new Error('Both title and content are required to rewrite the article.');
  }

  const model = modelOverride?.trim() || process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;

  const payload = await runWithOllamaHost('Ollama generate', async (ollamaHost) => {
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: buildPrompt(title, content, tone),
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
