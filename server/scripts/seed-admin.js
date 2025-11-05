import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';

dotenv.config();

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.split('=');
      if (value !== undefined) {
        options[key.substring(2)] = value;
      } else if (args[i + 1] && !args[i + 1].startsWith('--')) {
        options[key.substring(2)] = args[i + 1];
        i += 1;
      } else {
        options[key.substring(2)] = true;
      }
    }
  }

  return options;
};

const run = async () => {
  const { email, password, name } = parseArgs();

  if (!email || !password || !name) {
    console.error('Usage: node server/scripts/seed-admin.js --email you@example.com --password secret --name "Admin User"');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not configured');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO admin_users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET password_hash = EXCLUDED.password_hash,
                     full_name = EXCLUDED.full_name,
                     updated_at = NOW()
       RETURNING id, email, full_name`,
      [email, hash, name],
    );

    const admin = result.rows[0];
    console.log(`Admin user ready: ${admin.email} (${admin.full_name})`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin user', error);
    process.exit(1);
  }
};

run();
