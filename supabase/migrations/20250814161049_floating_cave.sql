/*
  # Add SEO and Image Fields to Custom Services

  1. New Columns Added
    - `subtitle` (text) - Service subtitle for better presentation
    - `slug` (text) - URL-friendly identifier for services
    - `seo_title` (text) - SEO optimized title
    - `seo_description` (text) - SEO meta description
    - `image_url` (text) - Service image URL

  2. Indexes
    - Add unique index on consultant_id + slug combination
    - Add index on slug for fast lookups

  3. Data Migration
    - Generate slugs for existing services
    - Set default values for new fields
*/

-- Add new columns to custom_services table
DO $$
BEGIN
  -- Add subtitle column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_services' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE custom_services ADD COLUMN subtitle text;
  END IF;

  -- Add slug column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_services' AND column_name = 'slug'
  ) THEN
    ALTER TABLE custom_services ADD COLUMN slug text;
  END IF;

  -- Add seo_title column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_services' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE custom_services ADD COLUMN seo_title text;
  END IF;

  -- Add seo_description column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_services' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE custom_services ADD COLUMN seo_description text;
  END IF;

  -- Add image_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_services' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE custom_services ADD COLUMN image_url text;
  END IF;
END $$;

-- Generate slugs for existing services that don't have them
UPDATE custom_services 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Create unique index on consultant_id + slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_custom_services_consultant_slug'
  ) THEN
    CREATE UNIQUE INDEX idx_custom_services_consultant_slug 
    ON custom_services (consultant_id, slug);
  END IF;
END $$;

-- Create index on slug for fast lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_custom_services_slug'
  ) THEN
    CREATE INDEX idx_custom_services_slug 
    ON custom_services (slug);
  END IF;
END $$;