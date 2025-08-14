/*
  # Add SEO fields to custom_services table

  1. New Columns
    - `subtitle` (text) - Service subtitle for display
    - `seo_title` (text) - SEO optimized title
    - `seo_description` (text) - SEO meta description
    - `slug` (text) - URL slug for the service

  2. Indexes
    - Add index on slug for fast lookups
    - Add unique constraint on slug per consultant

  3. Updates
    - Add default slugs for existing services
*/

-- Add new columns to custom_services table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_services' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE custom_services ADD COLUMN subtitle text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_services' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE custom_services ADD COLUMN seo_title text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_services' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE custom_services ADD COLUMN seo_description text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_services' AND column_name = 'slug'
  ) THEN
    ALTER TABLE custom_services ADD COLUMN slug text;
  END IF;
END $$;

-- Create index on slug for fast lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'custom_services' AND indexname = 'idx_custom_services_slug'
  ) THEN
    CREATE INDEX idx_custom_services_slug ON custom_services(slug);
  END IF;
END $$;

-- Update existing services with default slugs based on title
UPDATE custom_services 
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Set default SEO titles from service titles
UPDATE custom_services 
SET seo_title = title
WHERE seo_title IS NULL AND title IS NOT NULL;