import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { loadAiNews, rewriteArticleWithOllama, fetchOllamaModels } from '../utils/aiContent.js';

const router = Router();

const parseKeywords = (raw) => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
};

router.get('/news', authenticate, async (req, res) => {
  try {
    const keywords = parseKeywords(req.query.keywords);
    const articles = await loadAiNews(keywords);
    return res.json({ articles });
  } catch (error) {
    console.error('[ai-content/news]', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch AI news headlines' });
  }
});

router.post('/rewrite', authenticate, async (req, res) => {
  const { title, content, model, tone, maxWords } = req.body || {};
  if (!title || !content) {
    return res.status(400).json({ message: 'title and content are required' });
  }

  try {
    const parsedLimit = Number(maxWords);
    const normalizedLimit = Number.isFinite(parsedLimit) ? parsedLimit : undefined;
    const result = await rewriteArticleWithOllama({ title, content, model, tone, maxWords: normalizedLimit });
    return res.json(result);
  } catch (error) {
    console.error('[ai-content/rewrite]', error);
    return res.status(500).json({ message: error.message || 'Failed to rewrite the article' });
  }
});

router.get('/models', authenticate, async (_req, res) => {
  try {
    const models = await fetchOllamaModels();
    return res.json({ models });
  } catch (error) {
    console.error('[ai-content/models]', error);
    return res.status(500).json({ message: error.message || 'Failed to load Ollama models' });
  }
});

export default router;
