import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { query, withTransaction } from '../db.js';

const router = Router();

let schemaReadyPromise;

const ensureProductSchema = () => {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      try {
        await query('ALTER TABLE products ADD COLUMN IF NOT EXISTS page_content TEXT');
      } catch (error) {
        console.error('[products/schema]', error);
      }
    })();
  }
  return schemaReadyPromise;
};

const hydrateProducts = (products, features, images) => {
  const featureMap = new Map();
  for (const feature of features) {
    if (!featureMap.has(feature.product_id)) {
      featureMap.set(feature.product_id, []);
    }
    featureMap.get(feature.product_id).push(feature.feature_text);
  }

  const imageMap = new Map();
  for (const image of images) {
    if (!imageMap.has(image.product_id)) {
      imageMap.set(image.product_id, []);
    }
    imageMap.get(image.product_id).push(image.image_url);
  }

  return products.map((product) => ({
    ...product,
    features: featureMap.get(product.id) || [],
    images: imageMap.get(product.id) || [],
  }));
};

router.get('/', async (_req, res) => {
  try {
    await ensureProductSchema();
    const [productsResult, featuresResult, imagesResult] = await Promise.all([
      query(
        `SELECT id,
                title,
                description,
                long_description AS "longDescription",
                page_content     AS "pageContent",
                display_order    AS "displayOrder",
                created_at       AS "createdAt",
                updated_at       AS "updatedAt"
           FROM products
          ORDER BY display_order ASC NULLS LAST, id ASC`,
      ),
      query(
        `SELECT product_id,
                feature_text,
                position
           FROM product_features
          ORDER BY product_id ASC, position ASC`,
      ),
      query(
        `SELECT product_id,
                image_url,
                position
           FROM product_images
          ORDER BY product_id ASC, position ASC`,
      ),
    ]);

    const products = hydrateProducts(productsResult.rows, featuresResult.rows, imagesResult.rows);
    return res.json(products);
  } catch (error) {
    console.error('[products/get]', error);
    return res.status(500).json({ message: 'Failed to load products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await ensureProductSchema();
    const productResult = await query(
      `SELECT id,
              title,
              description,
              long_description AS "longDescription",
              page_content     AS "pageContent",
              display_order    AS "displayOrder",
              created_at       AS "createdAt",
              updated_at       AS "updatedAt"
         FROM products
        WHERE id = $1
        LIMIT 1`,
      [req.params.id],
    );

    if (productResult.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productResult.rows[0];

    const [featuresResult, imagesResult] = await Promise.all([
      query(
        `SELECT feature_text
           FROM product_features
          WHERE product_id = $1
          ORDER BY position ASC`,
        [product.id],
      ),
      query(
        `SELECT image_url
           FROM product_images
          WHERE product_id = $1
          ORDER BY position ASC`,
        [product.id],
      ),
    ]);

    return res.json({
      ...product,
      features: featuresResult.rows.map((row) => row.feature_text),
      images: imagesResult.rows.map((row) => row.image_url),
    });
  } catch (error) {
    console.error('[products/get:id]', error);
    return res.status(500).json({ message: 'Failed to load product' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { title, description, longDescription, pageContent, features = [], images = [], displayOrder } = req.body;

  if (!title || !description || !longDescription) {
    return res.status(400).json({ message: 'title, description, and longDescription are required' });
  }

  try {
    await ensureProductSchema();
    const product = await withTransaction(async (client) => {
      const productResult = await client.query(
        `INSERT INTO products (title, description, long_description, page_content, display_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id,
                   title,
                   description,
                   long_description AS "longDescription",
                   page_content     AS "pageContent",
                   display_order    AS "displayOrder"`,
        [title, description, longDescription, pageContent || null, displayOrder ?? null],
      );

      const created = productResult.rows[0];

      for (const [index, feature] of features.entries()) {
        if (!feature) continue;
        await client.query(
          `INSERT INTO product_features (product_id, feature_text, position)
           VALUES ($1, $2, $3)`,
          [created.id, feature, index],
        );
      }

      for (const [index, imageUrl] of images.entries()) {
        if (!imageUrl) continue;
        await client.query(
          `INSERT INTO product_images (product_id, image_url, position)
           VALUES ($1, $2, $3)`,
          [created.id, imageUrl, index],
        );
      }

      return created;
    });

    return res.status(201).json({
      ...product,
      features: features.filter(Boolean),
      images: images.filter(Boolean),
      pageContent: product.pageContent || pageContent || null,
    });
  } catch (error) {
    console.error('[products/post]', error);
    return res.status(500).json({ message: 'Failed to create product' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, description, longDescription, pageContent, features = [], images = [], displayOrder } = req.body;

  if (!title || !description || !longDescription) {
    return res.status(400).json({ message: 'title, description, and longDescription are required' });
  }

  try {
    await ensureProductSchema();
    const updated = await withTransaction(async (client) => {
      const result = await client.query(
        `UPDATE products
            SET title = $1,
                description = $2,
                long_description = $3,
                page_content = $4,
                display_order = $5,
                updated_at = NOW()
          WHERE id = $6
          RETURNING id,
                    title,
                    description,
                    long_description AS "longDescription",
                    page_content     AS "pageContent",
                    display_order    AS "displayOrder"`,
        [title, description, longDescription, pageContent || null, displayOrder ?? null, id],
      );

      if (result.rowCount === 0) {
        return null;
      }

      await client.query('DELETE FROM product_features WHERE product_id = $1', [id]);
      await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);

      for (const [index, feature] of features.entries()) {
        if (!feature) continue;
        await client.query(
          `INSERT INTO product_features (product_id, feature_text, position)
           VALUES ($1, $2, $3)`,
          [id, feature, index],
        );
      }

      for (const [index, imageUrl] of images.entries()) {
        if (!imageUrl) continue;
        await client.query(
          `INSERT INTO product_images (product_id, image_url, position)
           VALUES ($1, $2, $3)`,
          [id, imageUrl, index],
        );
      }

      return result.rows[0];
    });

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      ...updated,
      features: features.filter(Boolean),
      images: images.filter(Boolean),
    });
  } catch (error) {
    console.error('[products/put]', error);
    return res.status(500).json({ message: 'Failed to update product' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM products WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('[products/delete]', error);
    return res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;
