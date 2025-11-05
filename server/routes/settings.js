import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { query, withTransaction } from '../db.js';

const router = Router();

const defaultSettings = {
  companyName: 'QuantumLeap AI',
  tagline: 'Innovate with Intelligence',
  heroHeadline: 'Innovate with Intelligence',
  heroSubheadline: 'We build custom AI to solve your most complex business challenges.',
  contactEmail: 'hello@example.com',
  contactPhone: '+1 (555) 123-4567',
  contactAddress: '123 Innovation Way, Tech City',
  blogPreviewLimit: 3,
  productPreviewLimit: 2,
  logoUrl: null,
  backgroundPattern: 'mesh',
};

const ensureSettingsSchema = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        company_name TEXT NOT NULL,
        tagline TEXT,
        hero_headline TEXT NOT NULL,
        hero_subheadline TEXT,
        contact_email TEXT NOT NULL,
        contact_phone TEXT,
        contact_address TEXT,
        logo_url TEXT,
        blog_preview_limit INTEGER DEFAULT 3,
        product_preview_limit INTEGER DEFAULT 2,
        background_pattern TEXT DEFAULT 'mesh',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id SERIAL PRIMARY KEY,
        supertitle TEXT,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        image_url TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await query('ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS blog_preview_limit INTEGER DEFAULT 3');
    await query('ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS product_preview_limit INTEGER DEFAULT 2');
    await query('ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT');
    await query('ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS background_pattern TEXT DEFAULT \'mesh\'');
    await query('ALTER TABLE site_settings ALTER COLUMN blog_preview_limit SET DEFAULT 3');
    await query('ALTER TABLE site_settings ALTER COLUMN product_preview_limit SET DEFAULT 2');
    await query('ALTER TABLE site_settings ALTER COLUMN background_pattern SET DEFAULT \'mesh\'');
    await query('UPDATE site_settings SET background_pattern = \'mesh\' WHERE background_pattern IS NULL');
  } catch (error) {
    console.error('[settings/schema]', error);
  }
};

router.get('/', async (_req, res) => {
  try {
    await ensureSettingsSchema();
    const settingsResult = await query(
      `SELECT id,
              company_name    AS "companyName",
              tagline,
              hero_headline    AS "heroHeadline",
              hero_subheadline AS "heroSubheadline",
              contact_email    AS "contactEmail",
              contact_phone    AS "contactPhone",
              contact_address  AS "contactAddress",
              logo_url         AS "logoUrl",
              blog_preview_limit    AS "blogPreviewLimit",
              product_preview_limit AS "productPreviewLimit",
              background_pattern    AS "backgroundPattern"
         FROM site_settings
        ORDER BY id ASC
        LIMIT 1`,
    );

    const slidesResult = await query(
      `SELECT id,
              supertitle,
              title,
              subtitle,
              image_url AS "imageUrl",
              order_index AS "order"
         FROM hero_slides
        ORDER BY order_index ASC, id ASC`
    );

    const settings = settingsResult.rowCount
      ? { ...defaultSettings, ...settingsResult.rows[0] }
      : { ...defaultSettings };

    return res.json({
      settings,
      heroSlides: slidesResult.rows,
    });
  } catch (error) {
    console.error('[settings/get]', error);
    return res.status(500).json({ message: 'Failed to load settings' });
  }
});

const updateGeneralSettings = async (payload, client) => {
  const {
    companyName,
    tagline,
    heroHeadline,
    heroSubheadline,
    contactEmail,
    contactPhone,
    contactAddress,
    blogPreviewLimit,
    productPreviewLimit,
    logoUrl,
    backgroundPattern,
  } = payload;

  if (!companyName || !heroHeadline || !contactEmail) {
    const error = new Error('companyName, heroHeadline, and contactEmail are required');
    error.status = 400;
    throw error;
  }

  const normalizedBlogLimit = Number.isFinite(Number(blogPreviewLimit)) ? Number(blogPreviewLimit) : defaultSettings.blogPreviewLimit;
  const normalizedProductLimit = Number.isFinite(Number(productPreviewLimit))
    ? Number(productPreviewLimit)
    : defaultSettings.productPreviewLimit;
  const normalizedPattern = backgroundPattern || defaultSettings.backgroundPattern;

  const existing = await client.query('SELECT id FROM site_settings LIMIT 1');
  if (existing.rowCount) {
    await client.query(
      `UPDATE site_settings
          SET company_name = $1,
              tagline = $2,
              hero_headline = $3,
              hero_subheadline = $4,
              contact_email = $5,
              contact_phone = $6,
              contact_address = $7,
              logo_url = $8,
              blog_preview_limit = $9,
              product_preview_limit = $10,
              background_pattern = $11,
              updated_at = NOW()
        WHERE id = $12`,
      [
        companyName,
        tagline || null,
        heroHeadline,
        heroSubheadline || null,
        contactEmail,
        contactPhone || null,
        contactAddress || null,
        logoUrl || null,
        normalizedBlogLimit,
        normalizedProductLimit,
        normalizedPattern,
        existing.rows[0].id,
      ],
    );
  } else {
    await client.query(
      `INSERT INTO site_settings
         (company_name, tagline, hero_headline, hero_subheadline, contact_email, contact_phone, contact_address, logo_url, blog_preview_limit, product_preview_limit, background_pattern)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        companyName,
        tagline || null,
        heroHeadline,
        heroSubheadline || null,
        contactEmail,
        contactPhone || null,
        contactAddress || null,
        logoUrl || null,
        normalizedBlogLimit,
        normalizedProductLimit,
        normalizedPattern,
      ],
    );
  }

  const refreshed = await client.query(
    `SELECT company_name    AS "companyName",
            tagline,
            hero_headline    AS "heroHeadline",
            hero_subheadline AS "heroSubheadline",
            contact_email    AS "contactEmail",
            contact_phone    AS "contactPhone",
            contact_address  AS "contactAddress",
            logo_url         AS "logoUrl",
            blog_preview_limit    AS "blogPreviewLimit",
            product_preview_limit AS "productPreviewLimit",
            background_pattern    AS "backgroundPattern"
       FROM site_settings
      ORDER BY id ASC
      LIMIT 1`,
  );

  return refreshed.rowCount
    ? { ...defaultSettings, ...refreshed.rows[0] }
    : { ...defaultSettings };
};

const updateHeroSlides = async (heroSlides = [], client) => {
  await client.query('DELETE FROM hero_slides');

  for (const [index, slide] of heroSlides.entries()) {
    if (!slide.title || !slide.subtitle) {
      continue;
    }
    await client.query(
      `INSERT INTO hero_slides (supertitle, title, subtitle, image_url, order_index)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        slide.supertitle || null,
        slide.title,
        slide.subtitle,
        slide.imageUrl || null,
        typeof slide.order === 'number' ? slide.order : index,
      ],
    );
  }

  const refreshed = await client.query(
    `SELECT id,
            supertitle,
            title,
            subtitle,
            image_url AS "imageUrl",
            order_index AS "order"
       FROM hero_slides
      ORDER BY order_index ASC, id ASC`,
  );

  return refreshed.rows;
};

router.put('/general', authenticate, async (req, res) => {
  try {
    await ensureSettingsSchema();
    const result = await withTransaction((client) => updateGeneralSettings(req.body, client));
    return res.json({ settings: result });
  } catch (error) {
    console.error('[settings/general:put]', error);
    return res.status(error.status || 500).json({ message: error.message || 'Failed to update settings' });
  }
});

router.put('/hero', authenticate, async (req, res) => {
  try {
    await ensureSettingsSchema();
    const slides = await withTransaction((client) => updateHeroSlides(req.body.heroSlides || [], client));
    return res.json({ heroSlides: slides });
  } catch (error) {
    console.error('[settings/hero:put]', error);
    return res.status(500).json({ message: 'Failed to update hero slides' });
  }
});

router.put('/', authenticate, async (req, res) => {
  try {
    await ensureSettingsSchema();
    await withTransaction(async (client) => {
      await updateGeneralSettings(req.body, client);
      await updateHeroSlides(req.body.heroSlides || [], client);
    });
    return res.json({ message: 'Settings updated' });
  } catch (error) {
    console.error('[settings/put]', error);
    return res.status(error.status || 500).json({ message: error.message || 'Failed to update settings' });
  }
});

export default router;
