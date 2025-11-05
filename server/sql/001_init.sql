CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
);

CREATE TABLE IF NOT EXISTS hero_slides (
    id SERIAL PRIMARY KEY,
    supertitle TEXT,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT,
    icon_key TEXT,
    display_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    page_content TEXT,
    display_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_features (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    feature_text TEXT NOT NULL,
    position INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    position INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    image_url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS page_content TEXT;

ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS blog_preview_limit INTEGER DEFAULT 3;

ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS product_preview_limit INTEGER DEFAULT 2;

ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS background_pattern TEXT DEFAULT 'mesh';

CREATE INDEX IF NOT EXISTS idx_services_display_order ON services (display_order NULLS LAST, id);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products (display_order NULLS LAST, id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts (published_at DESC NULLS LAST);
