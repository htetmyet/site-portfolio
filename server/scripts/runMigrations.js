import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { pool } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../sql');

const migrationFiles = ['001_init.sql'];

const readMigration = async (filename) => {
  const fullPath = path.join(migrationsDir, filename);
  const sql = await fs.readFile(fullPath, 'utf8');
  return sql.trim();
};

export const runMigrations = async () => {
  const client = await pool.connect();
  try {
    for (const file of migrationFiles) {
      const sql = await readMigration(file);
      if (!sql) {
        continue;
      }
      await client.query(sql);
    }
    console.log('[db] migrations applied');
  } catch (error) {
    console.error('[db] migration error', error);
    throw error;
  } finally {
    client.release();
  }
};

