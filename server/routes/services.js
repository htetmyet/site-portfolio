import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id,
              title,
              description,
              color,
              icon_key AS "iconKey",
              created_at AS "createdAt",
              updated_at AS "updatedAt"
         FROM services
        ORDER BY display_order ASC, id ASC`,
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('[services/get]', error);
    return res.status(500).json({ message: 'Failed to load services' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { title, description, color, iconKey, displayOrder } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'title and description are required' });
  }

  try {
    const result = await query(
      `INSERT INTO services (title, description, color, icon_key, display_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, color, icon_key AS "iconKey", display_order AS "displayOrder"`,
      [title, description, color || null, iconKey || null, displayOrder ?? null],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[services/post]', error);
    return res.status(500).json({ message: 'Failed to create service' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, description, color, iconKey, displayOrder } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'title and description are required' });
  }

  try {
    const result = await query(
      `UPDATE services
          SET title = $1,
              description = $2,
              color = $3,
              icon_key = $4,
              display_order = $5,
              updated_at = NOW()
        WHERE id = $6
        RETURNING id, title, description, color, icon_key AS "iconKey", display_order AS "displayOrder"`,
      [title, description, color || null, iconKey || null, displayOrder ?? null, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('[services/put]', error);
    return res.status(500).json({ message: 'Failed to update service' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM services WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('[services/delete]', error);
    return res.status(500).json({ message: 'Failed to delete service' });
  }
});

export default router;
