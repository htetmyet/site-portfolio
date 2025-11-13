import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const normalizeTags = (value) => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const mapRow = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  description: row.description,
  tags: row.tags ?? [],
  imageUrl: row.imageUrl,
  displayOrder: row.displayOrder,
});

router.get('/', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id,
              title,
              category,
              description,
              tags,
              image_url AS "imageUrl",
              display_order AS "displayOrder"
         FROM projects
        ORDER BY display_order ASC NULLS LAST, id ASC`,
    );
    return res.json(result.rows.map(mapRow));
  } catch (error) {
    console.error('[projects/get]', error);
    return res.status(500).json({ message: 'Failed to load projects' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { title, category, description, tags, imageUrl, displayOrder } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ message: 'title, category, and description are required' });
  }

  try {
    const result = await query(
      `INSERT INTO projects (title, category, description, tags, image_url, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id,
                 title,
                 category,
                 description,
                 tags,
                 image_url AS "imageUrl",
                 display_order AS "displayOrder"`,
      [title, category, description, normalizeTags(tags), imageUrl || null, displayOrder ?? null],
    );
    return res.status(201).json(mapRow(result.rows[0]));
  } catch (error) {
    console.error('[projects/post]', error);
    return res.status(500).json({ message: 'Failed to create project' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, category, description, tags, imageUrl, displayOrder } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ message: 'title, category, and description are required' });
  }

  try {
    const result = await query(
      `UPDATE projects
          SET title = $1,
              category = $2,
              description = $3,
              tags = $4,
              image_url = $5,
              display_order = $6,
              updated_at = NOW()
        WHERE id = $7
        RETURNING id,
                  title,
                  category,
                  description,
                  tags,
                  image_url AS "imageUrl",
                  display_order AS "displayOrder"`,
      [title, category, description, normalizeTags(tags), imageUrl || null, displayOrder ?? null, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json(mapRow(result.rows[0]));
  } catch (error) {
    console.error('[projects/put]', error);
    return res.status(500).json({ message: 'Failed to update project' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM projects WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('[projects/delete]', error);
    return res.status(500).json({ message: 'Failed to delete project' });
  }
});

export default router;
