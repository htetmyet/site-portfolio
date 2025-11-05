import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await query('SELECT id, email, password_hash, full_name FROM admin_users WHERE email = $1 LIMIT 1', [email]);
    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.full_name },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      admin: {
        id: user.id,
        email: user.email,
        name: user.full_name,
      },
    });
  } catch (error) {
    console.error('[auth/login]', error);
    return res.status(500).json({ message: 'Failed to authenticate' });
  }
});

export default router;
