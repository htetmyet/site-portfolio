import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth.js';
import { query } from '../db.js';

const router = Router();

const sanitizeUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.full_name,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.use(authenticate);

router.get('/me', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, full_name, created_at, updated_at
         FROM admin_users
        WHERE id = $1
        LIMIT 1`,
      [req.user.sub],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.json(sanitizeUser(result.rows[0]));
  } catch (error) {
    console.error('[adminUsers/me:get]', error);
    return res.status(500).json({ message: 'Failed to load account' });
  }
});

router.put('/me', async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: 'Email and name are required' });
  }

  try {
    const existing = await query(
      `SELECT id
         FROM admin_users
        WHERE email = $1 AND id <> $2
        LIMIT 1`,
      [email, req.user.sub],
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const updated = await query(
      `UPDATE admin_users
          SET email = $1,
              full_name = $2,
              updated_at = NOW()
        WHERE id = $3
        RETURNING id, email, full_name, created_at, updated_at`,
      [email, name, req.user.sub],
    );

    return res.json(sanitizeUser(updated.rows[0]));
  } catch (error) {
    console.error('[adminUsers/me:put]', error);
    return res.status(500).json({ message: 'Failed to update account' });
  }
});

router.put('/me/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }

  try {
    const result = await query(
      `SELECT password_hash
         FROM admin_users
        WHERE id = $1
        LIMIT 1`,
      [req.user.sub],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await query(
      `UPDATE admin_users
          SET password_hash = $1,
              updated_at = NOW()
        WHERE id = $2`,
      [hashed, req.user.sub],
    );

    return res.json({ message: 'Password updated' });
  } catch (error) {
    console.error('[adminUsers/me/password:put]', error);
    return res.status(500).json({ message: 'Failed to update password' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, email, full_name, created_at, updated_at
         FROM admin_users
        ORDER BY created_at ASC`,
    );
    return res.json(result.rows.map(sanitizeUser));
  } catch (error) {
    console.error('[adminUsers/list]', error);
    return res.status(500).json({ message: 'Failed to load admins' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, full_name, created_at, updated_at
         FROM admin_users
        WHERE id = $1
        LIMIT 1`,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.json(sanitizeUser(result.rows[0]));
  } catch (error) {
    console.error('[adminUsers/getOne]', error);
    return res.status(500).json({ message: 'Failed to load admin' });
  }
});

router.post('/', async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ message: 'Email, name, and password are required' });
  }

  try {
    const existing = await query(
      `SELECT id
         FROM admin_users
        WHERE email = $1
        LIMIT 1`,
      [email],
    );
    if (existing.rowCount) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO admin_users (email, full_name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, created_at, updated_at`,
      [email, name, hashed],
    );

    return res.status(201).json(sanitizeUser(result.rows[0]));
  } catch (error) {
    console.error('[adminUsers/create]', error);
    return res.status(500).json({ message: 'Failed to create admin' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email, name, password } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: 'Email and name are required' });
  }

  try {
    const exists = await query(
      `SELECT id
         FROM admin_users
        WHERE id = $1`,
      [id],
    );
    if (exists.rowCount === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const duplicate = await query(
      `SELECT id
         FROM admin_users
        WHERE email = $1 AND id <> $2
        LIMIT 1`,
      [email, id],
    );
    if (duplicate.rowCount) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await query(
        `UPDATE admin_users
            SET password_hash = $1,
                updated_at = NOW()
          WHERE id = $2`,
        [hashed, id],
      );
    }

    const updated = await query(
      `UPDATE admin_users
          SET email = $1,
              full_name = $2,
              updated_at = NOW()
        WHERE id = $3
        RETURNING id, email, full_name, created_at, updated_at`,
      [email, name, id],
    );

    return res.json(sanitizeUser(updated.rows[0]));
  } catch (error) {
    console.error('[adminUsers/update]', error);
    return res.status(500).json({ message: 'Failed to update admin' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (Number(id) === req.user.sub) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  try {
    const countResult = await query('SELECT COUNT(*)::int AS total FROM admin_users');
    if ((countResult.rows[0]?.total ?? 0) <= 1) {
      return res.status(400).json({ message: 'At least one admin account must remain' });
    }

    const result = await query('DELETE FROM admin_users WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('[adminUsers/delete]', error);
    return res.status(500).json({ message: 'Failed to delete admin' });
  }
});

export default router;
