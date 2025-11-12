import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import servicesRoutes from './routes/services.js';
import productsRoutes from './routes/products.js';
import postsRoutes from './routes/posts.js';
import adminUsersRoutes from './routes/adminUsers.js';
import contactRoutes from './routes/contact.js';
import { pool } from './db.js';
import { runMigrations } from './scripts/runMigrations.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : undefined;

app.use(
  cors({
    origin: corsOrigins || true,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('[health]', error);
    res.status(500).json({ status: 'error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/contact', contactRoutes);

app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const start = async () => {
  try {
    await runMigrations();
  } catch (error) {
    console.error('[startup] failed to apply migrations', error);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
};

start();
