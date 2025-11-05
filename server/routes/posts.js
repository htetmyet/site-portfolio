import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { query } from '../db.js';
import { normalizeArrayField } from '../utils/validators.js';

const router = Router();

const mapPost = (row) => ({
  id: row.id,
  title: row.title,
  excerpt: row.excerpt,
  content: row.content,
  category: row.category,
  tags: row.tags || [],
  imageUrl: row.image_url,
  publishedAt: row.published_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.get('/', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id,
              title,
              excerpt,
              content,
              category,
              tags,
              image_url,
              published_at,
              created_at,
              updated_at
         FROM posts
        ORDER BY published_at DESC NULLS LAST, created_at DESC`,
    );
    return res.json(result.rows.map(mapPost));
  } catch (error) {
    console.error('[posts/get]', error);
    return res.status(500).json({ message: 'Failed to load posts' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id,
              title,
              excerpt,
              content,
              category,
              tags,
              image_url,
              published_at,
              created_at,
              updated_at
         FROM posts
        WHERE id = $1`,
      [req.params.id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.json(mapPost(result.rows[0]));
  } catch (error) {
    console.error('[posts/get/:id]', error);
    return res.status(500).json({ message: 'Failed to load post' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { title, excerpt, content, category, tags, imageUrl, publishedAt } = req.body;

  if (!title || !excerpt || !content) {
    return res.status(400).json({ message: 'title, excerpt, and content are required' });
  }

  try {
    const normalizedTags = normalizeArrayField(tags);
    const result = await query(
      `INSERT INTO posts (title, excerpt, content, category, tags, image_url, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id,
                 title,
                 excerpt,
                 content,
                 category,
                 tags,
                 image_url,
                 published_at,
                 created_at,
                 updated_at`,
      [
        title,
        excerpt,
        content,
        category || null,
        normalizedTags.length ? normalizedTags : null,
        imageUrl || null,
        publishedAt || null,
      ],
    );

    return res.status(201).json(mapPost(result.rows[0]));
  } catch (error) {
    console.error('[posts/post]', error);
    return res.status(500).json({ message: 'Failed to create post' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, excerpt, content, category, tags, imageUrl, publishedAt } = req.body;

  if (!title || !excerpt || !content) {
    return res.status(400).json({ message: 'title, excerpt, and content are required' });
  }

  try {
    const normalizedTags = normalizeArrayField(tags);
    const result = await query(
      `UPDATE posts
          SET title = $1,
              excerpt = $2,
              content = $3,
              category = $4,
              tags = $5,
              image_url = $6,
              published_at = $7,
              updated_at = NOW()
        WHERE id = $8
        RETURNING id,
                  title,
                  excerpt,
                  content,
                  category,
                  tags,
                  image_url,
                  published_at,
                  created_at,
                  updated_at`,
      [
        title,
        excerpt,
        content,
        category || null,
        normalizedTags.length ? normalizedTags : null,
        imageUrl || null,
        publishedAt || null,
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.json(mapPost(result.rows[0]));
  } catch (error) {
    console.error('[posts/put]', error);
    return res.status(500).json({ message: 'Failed to update post' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('[posts/delete]', error);
    return res.status(500).json({ message: 'Failed to delete post' });
  }
});

export default router;
