import 'dotenv/config';
import { Router } from 'express';
import { query } from '../db.js';
import { requireFields } from '../utils/validators.js';
import { isEmailConfigured, sendContactEmail } from '../utils/mailer.js';

const router = Router();

const defaultRecipient = process.env.CONTACT_FALLBACK_EMAIL || 'hello@example.com';

const fetchContactEmail = async () => {
  try {
    const result = await query(
      `SELECT contact_email AS "contactEmail"
         FROM site_settings
        ORDER BY id ASC
        LIMIT 1`,
    );
    if (result.rowCount && result.rows[0].contactEmail) {
      return result.rows[0].contactEmail;
    }
  } catch (error) {
    console.error('[contact/fetch-email]', error);
  }
  return defaultRecipient;
};

const sanitize = (value = '') => value.toString().trim();

const isValidEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

router.post('/', requireFields(['name', 'email', 'message']), async (req, res) => {
  if (!isEmailConfigured()) {
    return res.status(500).json({ message: 'Email service is not configured.' });
  }

  const name = sanitize(req.body.name);
  const email = sanitize(req.body.email);
  const message = sanitize(req.body.message);

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  if (message.length < 10) {
    return res.status(400).json({ message: 'Please provide a bit more detail in your message.' });
  }

  try {
    const recipient = await fetchContactEmail();
    await sendContactEmail({ name, email, message, to: recipient });
    return res.json({ message: 'Thanks! Your message is on its way.' });
  } catch (error) {
    console.error('[contact/post]', error);
    return res.status(500).json({ message: 'Failed to send your message. Please try again later.' });
  }
});

export default router;
